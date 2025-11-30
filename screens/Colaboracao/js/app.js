// Elementos da interface
const btnAddMap = document.getElementById('btnAddMap');
const mapModal = document.getElementById('mapModal');
const pointDetailsModal = document.getElementById('pointDetailsModal');
const closeMapModal = document.getElementById('closeMapModal');
const closePointDetailsModal = document.getElementById('closePointDetailsModal');
const notification = document.getElementById('notification');
const interactiveMap = document.getElementById('interactiveMap');
const mapArea = document.getElementById('mapArea');
const mapPlaceholder = document.getElementById('mapPlaceholder');
const totalFindings = document.getElementById('totalFindings');
const zeroPoints = document.getElementById('zeroPoints');
const lastUpdate = document.getElementById('lastUpdate');
const artifactsGrid = document.getElementById('artifactsGrid');
const tabs = document.querySelectorAll('.tab');
const fileInput = document.getElementById('fileInput');
const imageInput = document.getElementById('imageInput');

// Elementos da tela do mapa detalhado
const mainScreen = document.querySelector('.main-screen');
const mapDetailScreen = document.querySelector('.map-detail-screen');
const backButton = document.getElementById('backButton');
const detailedMapCanvas = document.getElementById('detailedMapCanvas');
const coordinatesDisplay = document.getElementById('coordinatesDisplay');
const mapGrid = document.getElementById('mapGrid');
const detailedMapPoints = document.getElementById('detailedMapPoints');
const addingModeIndicator = document.getElementById('addingModeIndicator');
const addingModeText = document.getElementById('addingModeText');
const cancelAddMode = document.getElementById('cancelAddMode');
const btnAddZeroPoint = document.getElementById('btnAddZeroPoint');
const btnAddCommonPoint = document.getElementById('btnAddCommonPoint');

// Opções dos modais
const optionGallery = document.getElementById('optionGallery');
const optionFiles = document.getElementById('optionFiles');

// Elementos de detalhes do ponto
const pointName = document.getElementById('pointName');
const pointDescription = document.getElementById('pointDescription');
const pointCategory = document.getElementById('pointCategory');
const pointEra = document.getElementById('pointEra');
const pointState = document.getElementById('pointState');
const pointMaterial = document.getElementById('pointMaterial');
const pointCoordinates = document.getElementById('pointCoordinates');
const pointDiscoveryDate = document.getElementById('pointDiscoveryDate');
const pointTags = document.getElementById('pointTags');
const savePointDetails = document.getElementById('savePointDetails');
const cancelPointDetails = document.getElementById('cancelPointDetails');
const pointPhoto = document.getElementById('pointPhoto');
const photoPreview = document.getElementById('photoPreview');

// Estado da aplicação
let mapPoints = [];
let findingsCount = 0;
let zeroPointsCount = 0;
let isMapLoaded = false;
let currentMapImage = null;
let canvasContext = null;
let isGridVisible = true;
let addingPointMode = null;
let currentPointPosition = { x: 0, y: 0 };
let currentPhoto = null;
let editingPointId = null;

// Detectar dispositivo móvel
const isMobile = /Android|webOS|iPhone|iPad|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Função para mostrar notificação
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.background = type === 'success' ? 'var(--primary-color)' : 'var(--error-color)';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Função para lidar com upload de foto
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentPhoto = e.target.result;
                photoPreview.innerHTML = `<img src="${currentPhoto}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            showNotification('Por favor, selecione uma imagem válida.', 'error');
        }
    }
}

// ** PERSISTÊNCIA: Salva o estado atual do mapa no localStorage **
function saveCurrentMapState() {
    // Verifica se há um mapa carregado para salvar
    if (!isMapLoaded || !currentMapImage) return;

    const currentMapString = localStorage.getItem('currentMap');
    if (!currentMapString) return;

    // 1. Atualiza os dados do mapa atual
    let currentMap = JSON.parse(currentMapString);
    currentMap.pointsData = mapPoints;
    currentMap.points = findingsCount + zeroPointsCount; 
    currentMap.image = currentMapImage;
    
    // 2. Salva o mapa atualizado no storage
    localStorage.setItem('currentMap', JSON.stringify(currentMap));

    // 3. Atualiza a lista principal de mapas (para a galeria)
    const savedMapsString = localStorage.getItem('userMaps');
    let userMaps = savedMapsString ? JSON.parse(savedMapsString) : [];
    
    const mapIndex = userMaps.findIndex(m => m.id === currentMap.id);
    if (mapIndex !== -1) {
        userMaps[mapIndex] = currentMap;
    } else {
        // Se o mapa não foi encontrado, adiciona-o (caso de falha de sync anterior)
        userMaps.unshift(currentMap);
    }
    localStorage.setItem('userMaps', JSON.stringify(userMaps));
    
    console.log("Estado do mapa salvo com sucesso.");
}

// ** CARREGAMENTO: Função auxiliar para carregar o mapa após seleção/redirect **
function loadMapFromData(mapData) {
    // 1. Update global state from mapData
    mapPoints = mapData.pointsData || [];
    findingsCount = mapPoints.filter(p => p.type !== 'zero').length;
    zeroPointsCount = mapPoints.filter(p => p.type === 'zero').length;
    
    totalFindings.textContent = findingsCount;
    zeroPoints.textContent = zeroPointsCount;
    artifactsGrid.innerHTML = '';
    
    // 2. Load the base map image (this also sets currentMapImage and updates UI flags)
    loadMap(mapData.image, true);
    
    // 3. Re-render UI components
    updateArtifactGrid();
    
    // 4. Add points to the main interactive map
    const existingPoints = interactiveMap.querySelectorAll('.map-point');
    existingPoints.forEach(point => point.remove());

    mapPoints.forEach(p => {
        const point = document.createElement('div');
        point.className = `map-point ${p.type}-point`;
        point.style.left = `${p.x}%`;
        point.style.top = `${p.y}%`;
        point.setAttribute('data-title', p.details.name);
        point.setAttribute('data-id', p.id);
        point.innerHTML = p.type === 'zero' ? '⭐' : '💜';
        
        // CORREÇÃO: O listener deve ser vinculado ao *elemento DOM* 'point',
        // e 'showPointDetails' buscará o objeto 'p' (point object) pelo 'data-id'.
        point.addEventListener('click', (e) => {
            e.stopPropagation();
            // A função showPointDetails recebe o elemento DOM e procura o objeto por ID.
            showPointDetails(point); 
        });
        
        interactiveMap.appendChild(point);
    });
    
    showNotification('Mapa de trabalho carregado.');
}

// ** INICIALIZAÇÃO: Função para carregar o mapa atual do localStorage ou abrir o modal **
function loadCurrentMapFromStorage() {
    const currentMapString = localStorage.getItem('currentMap');
    
    if (currentMapString) {
        const currentMap = JSON.parse(currentMapString);
        
        // Se a imagem existir (mapa já criado/selecionado), carrega-o
        if (currentMap.image) {
             loadMapFromData(currentMap);
             btnAddMap.style.display = 'none';
             return;
        } 
    } 
    
    // Fluxo para 'Novo Trabalho' ou se o mapa atual não tem imagem, abre o modal.
    mapModal.style.display = 'flex';
    mapModal.classList.add('active');
    showNotification('Selecione uma imagem para iniciar o novo mapa.');
    btnAddMap.style.display = 'block';
}

// Função para adicionar ponto no mapa (Omitida para brevidade...)
function addMapPoint(x, y, title, type = 'common', details = {}) {
    const pointId = Date.now();
    const point = document.createElement('div');
    point.className = `map-point ${type}-point`;
    point.style.left = `${x}%`;
    point.style.top = `${y}%`;
    point.setAttribute('data-title', title);
    point.setAttribute('data-id', pointId);
    
    // Adicionar ícone baseado no tipo
    if (type === 'zero') {
        point.innerHTML = '⭐';
        zeroPointsCount++;
        zeroPoints.textContent = zeroPointsCount;
    } else {
        point.innerHTML = '💜';
        findingsCount++;
        totalFindings.textContent = findingsCount;
    }
    
    point.addEventListener('click', (e) => {
        e.stopPropagation();
        showPointDetails(point);
    });
    
    interactiveMap.appendChild(point);
    
    // Criar objeto do ponto
    const pointObj = {
        id: pointId,
        x, y, title, type,
        details: {
            name: details.name || title,
            description: details.description || '',
            category: details.category || '',
            era: details.era || '',
            state: details.state || '',
            material: details.material || '',
            coordinates: { x, y },
            discoveryDate: details.discoveryDate || new Date().toISOString().split('T')[0],
            tags: details.tags || [],
            altitude: details.altitude || null,
            photo: details.photo || null
        }
    };
    
    mapPoints.push(pointObj);
    
    updateLastUpdateTime();
    
    // Adicionar ao grid de artefatos
    addArtifactToGrid(pointObj);
    
    // Atualizar pontos no mapa detalhado se estiver ativo
    if (mapDetailScreen.classList.contains('active')) {
        renderDetailedPoints();
    }
    
    saveCurrentMapState(); // Salvar após adicionar ponto
    
    return pointObj;
}

// Função para adicionar artefato ao grid (Omitida para brevidade...)
function addArtifactToGrid(artifact) {
    const artifactCard = document.createElement('div');
    artifactCard.className = 'artifact-card';
    artifactCard.setAttribute('data-id', artifact.id);
    
    // Determinar conteúdo da imagem - mostrar foto se existir
    let imageContent = '';
    if (artifact.details.photo) {
        imageContent = `<img src="${artifact.details.photo}" alt="${artifact.details.name}" class="artifact-photo">`;
    } else {
        // Determinar ícone baseado na categoria
        let icon = '📦';
        if (artifact.details.category === 'ceramica') icon = '🏺';
        else if (artifact.details.category === 'metal') icon = '⚙️';
        else if (artifact.details.category === 'ferramentas') icon = '🛠️';
        else if (artifact.details.category === 'ossos') icon = '🦴';
        else if (artifact.details.category === 'adornos') icon = '💎';
        
        imageContent = `<div class="artifact-icon">${icon} ${artifact.type === 'zero' ? '⭐' : ''}</div>`;
    }
    
    artifactCard.innerHTML = `
        <div class="artifact-image">
            ${imageContent}
        </div>
        <div class="artifact-info">
            <div class="artifact-name">${artifact.details.name}</div>
            <div class="artifact-details">
                <div class="artifact-detail">📂 ${artifact.details.category || 'Sem categoria'}</div>
                <div class="artifact-detail">🕰️ ${artifact.details.era || 'Sem época'}</div>
                <div class="artifact-detail">📍 ${Math.round(artifact.x)}, ${Math.round(artifact.y)}</div>
                ${artifact.details.altitude ? `<div class="artifact-detail">📏 Altura: ${artifact.details.altitude}m</div>` : ''}
            </div>
            <div class="artifact-tags">
                ${artifact.details.tags.map(tag => `<span class="artifact-tag">${tag}</span>`).join('')}
                ${artifact.type === 'zero' ? '<span class="artifact-tag zero-tag">Ponto Zero</span>' : ''}
            </div>
        </div>
    `;
    
    artifactCard.addEventListener('click', () => {
        showArtifactDetails(artifact);
    });
    
    artifactsGrid.appendChild(artifactCard);
}

// Função para mostrar detalhes do artefato (Omitida para brevidade...)
function showArtifactDetails(artifact) {
    editingPointId = artifact.id;
    
    // Preencher modal de detalhes
    pointName.value = artifact.details.name;
    pointDescription.value = artifact.details.description;
    pointCategory.value = artifact.details.category;
    pointEra.value = artifact.details.era;
    pointState.value = artifact.details.state;
    pointMaterial.value = artifact.details.material;
    pointCoordinates.textContent = `X: ${Math.round(artifact.x)}, Y: ${Math.round(artifact.y)}`;
    pointDiscoveryDate.value = artifact.details.discoveryDate;
    
    // Mostrar foto se existir
    if (artifact.details.photo) {
        photoPreview.innerHTML = `<img src="${artifact.details.photo}" alt="Preview">`;
        currentPhoto = artifact.details.photo;
    } else {
        photoPreview.innerHTML = '';
        currentPhoto = null;
    }
    
    // Marcar tags selecionadas
    const tags = pointTags.querySelectorAll('.tag');
    tags.forEach(tag => {
        if (artifact.details.tags.includes(tag.getAttribute('data-value'))) {
            tag.classList.add('selected');
        } else {
            tag.classList.remove('selected');
        }
    });
    
    // Mostrar modal
    pointDetailsModal.style.display = 'flex';
    pointDetailsModal.classList.add('active');
    
    // Configurar função de salvar para atualizar
    savePointDetails.onclick = updateCurrentPoint;
}

// Função para atualizar o ponto atual (Omitida para brevidade...)
function updateCurrentPoint() {
    const selectedTags = [];
    pointTags.querySelectorAll('.tag.selected').forEach(tag => {
        selectedTags.push(tag.getAttribute('data-value'));
    });
    
    const pointIndex = mapPoints.findIndex(p => p.id === editingPointId);
    if (pointIndex === -1) return;
    
    mapPoints[pointIndex].details = {
        name: pointName.value,
        description: pointDescription.value,
        category: pointCategory.value,
        era: pointEra.value,
        state: pointState.value,
        material: pointMaterial.value,
        coordinates: { x: mapPoints[pointIndex].x, y: mapPoints[pointIndex].y },
        discoveryDate: pointDiscoveryDate.value,
        tags: selectedTags,
        altitude: mapPoints[pointIndex].details.altitude,
        photo: currentPhoto
    };
    
    // Atualizar grid
    updateArtifactGrid();
    
    // Atualizar pontos no mapa detalhado
    if (mapDetailScreen.classList.contains('active')) {
        renderDetailedPoints();
    }
    
    saveCurrentMapState(); // Salvar após atualização
    
    pointDetailsModal.style.display = 'none';
    pointDetailsModal.classList.remove('active');
    currentPhoto = null;
    editingPointId = null;
    showNotification('Achado atualizado com sucesso!');
}

// Função para atualizar grid de artefatos (Omitida para brevidade...)
function updateArtifactGrid() {
    artifactsGrid.innerHTML = '';
    mapPoints.forEach(point => {
        addArtifactToGrid(point);
    });
}

// Função para mostrar detalhes do ponto
function showPointDetails(pointElement) {
    // Procura o ID do ponto no atributo data-id do elemento DOM
    const pointId = pointElement.getAttribute('data-id');
    const point = mapPoints.find(p => p.id == pointId);
    
    if (point) {
        showArtifactDetails(point);
    }
}

// Função para atualizar o tempo da última atualização (Omitida para brevidade...)
function updateLastUpdateTime() {
    const now = new Date();
    lastUpdate.textContent = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Função para alternar aba ativa (Omitida para brevidade...)
function setActiveTab(tabElement) {
    tabs.forEach(tab => tab.classList.remove('active'));
    tabElement.classList.add('active');
}

// Função para carregar mapa (Omitida para brevidade...)
function loadMap(imageSrc = null, fromData = false) { 
    console.log('Carregando mapa...', imageSrc);
    
    if (!fromData) { // A limpeza de estado só ocorre se não estiver carregando de um mapa salvo.
        const existingPoints = interactiveMap.querySelectorAll('.map-point');
        existingPoints.forEach(point => point.remove());
        mapPoints = [];
        findingsCount = 0;
        zeroPointsCount = 0;
        totalFindings.textContent = findingsCount;
        zeroPoints.textContent = zeroPointsCount;
        artifactsGrid.innerHTML = '';
    }
    
    if (imageSrc) {
        interactiveMap.style.backgroundImage = `url(${imageSrc})`;
        interactiveMap.style.backgroundSize = 'cover';
        interactiveMap.style.backgroundPosition = 'center';
        currentMapImage = imageSrc;
        btnAddMap.style.display = 'none';
    } else {
        return;
    }
    
    mapPlaceholder.style.display = 'none';
    mapArea.classList.add('has-map');
    interactiveMap.style.display = 'block';
    isMapLoaded = true;
}

// Função para abrir galeria de imagens (Omitida para brevidade...)
function openImageGallery() {
    console.log('Abrindo galeria...');
    if (isMobile) {
        imageInput.setAttribute('accept', 'image/*');
        imageInput.setAttribute('capture', 'environment');
        imageInput.click();
    } else {
        imageInput.removeAttribute('capture');
        imageInput.click();
    }
}

// Função para abrir seletor de arquivos (Omitida para brevidade...)
function openFileSelector() {
    console.log('Abrindo seletor de arquivos...');
    fileInput.click();
}

// Função para processar imagem selecionada (Omitida para brevidade...)
function handleImageSelection(event) {
    const file = event.target.files[0];
    console.log('Arquivo selecionado:', file);
    
    if (file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                console.log('Imagem carregada com sucesso');
                
                const imageSrc = e.target.result;
                
                // 1. Cria ou Obtém o mapa (Para garantir um ID único para o Novo Trabalho)
                let currentMapString = localStorage.getItem('currentMap');
                let currentMap = currentMapString ? JSON.parse(currentMapString) : null;
                
                if (!currentMap || !currentMap.id) { 
                    // Novo Mapa: Cria o objeto completo
                    currentMap = {
                        id: Date.now(),
                        name: prompt('Nomeie seu novo mapa:') || `Mapa ${new Date().toLocaleDateString('pt-BR')}`,
                        image: imageSrc,
                        createdDate: new Date().toLocaleDateString('pt-BR'),
                        points: 0,
                        pointsData: []
                    };
                    
                    // Adiciona à lista de mapas do usuário
                    const savedMapsString = localStorage.getItem('userMaps');
                    let userMaps = savedMapsString ? JSON.parse(savedMapsString) : [];
                    userMaps.unshift(currentMap);
                    localStorage.setItem('userMaps', JSON.stringify(userMaps));

                } else {
                    // Atualiza a imagem se já existia um placeholder
                    currentMap.image = imageSrc;
                }
                
                // 2. Define a imagem e salva como mapa atual
                currentMap.image = imageSrc;
                localStorage.setItem('currentMap', JSON.stringify(currentMap)); 
                
                // 3. Carrega o mapa e fecha o modal
                loadMapFromData(currentMap);
                mapModal.style.display = 'none';
                mapModal.classList.remove('active');
                showNotification(`Mapa "${currentMap.name}" criado e carregado com sucesso!`);

            };
            reader.onerror = function(e) {
                console.error('Erro ao ler arquivo:', e);
                showNotification('Erro ao carregar a imagem.', 'error');
            };
            reader.readAsDataURL(file);
            showNotification('Processando imagem...');
        } else {
            showNotification('Por favor, selecione uma imagem válida.', 'error');
        }
    }
    event.target.value = '';
}


// Função para adicionar ponto zero (Omitida para brevidade...)
function addZeroPoint(x, y) {
    const altura = prompt('Digite a altura do ponto zero:');
    if (altura && !isNaN(parseFloat(altura))) {
        const pointDetails = {
            name: 'Ponto Zero',
            description: 'Ponto mais alto da área de escavação',
            category: 'referencia',
            state: 'identificado',
            tags: ['importante', 'referencia'],
            altitude: parseFloat(altura),
            photo: null
        };
        
        addMapPoint(x, y, pointDetails.name, 'zero', pointDetails);
        showNotification('Ponto Zero adicionado com sucesso!');
    } else if (altura !== null) {
        showNotification('Por favor, insira uma altura válida.', 'error');
    }
}

// Função para adicionar ponto comum com modal IMEDIATO (Omitida para brevidade...)
function addCommonPoint(x, y) {
    // Primeiro adiciona o ponto com dados básicos
    const pointDetails = {
        name: `Achado ${findingsCount + 1}`,
        description: '',
        category: '',
        era: '',
        state: 'identificado',
        material: '',
        tags: ['pesquisado'],
        photo: null
    };
    
    const newPoint = addMapPoint(x, y, pointDetails.name, 'common', pointDetails);
    
    // ABRE O MODAL IMEDIATAMENTE
    editingPointId = newPoint.id;
    
    // Preencher modal com dados básicos
    pointName.value = pointDetails.name;
    pointDescription.value = '';
    pointCategory.value = '';
    pointEra.value = '';
    pointState.value = 'identificado';
    pointMaterial.value = '';
    pointCoordinates.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
    pointDiscoveryDate.value = new Date().toISOString().split('T')[0];
    
    // Limpar preview da foto
    photoPreview.innerHTML = '';
    currentPhoto = null;
    
    // Limpar tags selecionadas
    pointTags.querySelectorAll('.tag').forEach(tag => {
        tag.classList.remove('selected');
    });
    
    // Selecionar tag "pesquisado" por padrão
    const pesquisadoTag = pointTags.querySelector('[data-value="pesquisado"]');
    if (pesquisadoTag) pesquisadoTag.classList.add('selected');
    
    // Configurar função de salvar
    savePointDetails.onclick = updateCurrentPoint;
    
    // MOSTRAR MODAL IMEDIATAMENTE
    pointDetailsModal.style.display = 'flex';
    pointDetailsModal.classList.add('active');
    
    // Desativar modo de adição após abrir o modal
    deactivateAddingMode();
    
    showNotification('Ponto adicionado! Preencha os detalhes.');
}

// Função para ativar modo de adição (Omitida para brevidade...)
function activateAddingMode(type) {
    addingPointMode = type;
    detailedMapCanvas.style.cursor = 'crosshair';
    addingModeIndicator.style.display = 'flex';
    
    if (type === 'zero') {
        addingModeText.textContent = 'Modo: Ponto Zero - Clique no mapa para adicionar';
        showNotification('Modo Ponto Zero ativado. Clique no mapa para posicionar.');
    } else {
        addingModeText.textContent = 'Modo: Achado Comum - Clique no mapa para adicionar';
        showNotification('Modo Achado Comum ativado. Clique no mapa para posicionar.');
    }
}

// Função para desativar modo de adição (Omitida para brevidade...)
function deactivateAddingMode() {
    addingPointMode = null;
    detailedMapCanvas.style.cursor = 'default';
    addingModeIndicator.style.display = 'none';
}

// Função para inicializar tela do mapa detalhado (Omitida para brevidade...)
function initializeDetailedMap() {
    console.log('Inicializando mapa detalhado...');
    canvasContext = detailedMapCanvas.getContext('2d');
    
    // Ajustar tamanho do canvas
    const container = detailedMapCanvas.parentElement;
    detailedMapCanvas.width = container.clientWidth;
    detailedMapCanvas.height = container.clientHeight;
    
    // Desenhar mapa
    drawDetailedMap();
    
    // Adicionar grade
    if (isGridVisible) {
        drawGrid();
    }
    
    // Adicionar pontos existentes
    renderDetailedPoints();
    
    // Adicionar eventos
    detailedMapCanvas.addEventListener('mousemove', handleCanvasMouseMove);
    detailedMapCanvas.addEventListener('click', handleCanvasClick);
}

// Função para desenhar mapa detalhado (Omitida para brevidade...)
function drawDetailedMap() {
    console.log('Desenhando mapa detalhado...');
    canvasContext.clearRect(0, 0, detailedMapCanvas.width, detailedMapCanvas.height);
    
    if (currentMapImage && currentMapImage !== 'sample') {
        const img = new Image();
        img.onload = function() {
            const scale = Math.min(
                detailedMapCanvas.width / img.width,
                detailedMapCanvas.height / img.height
            );
            const width = img.width * scale;
            const height = img.height * scale;
            const x = (detailedMapCanvas.width - width) / 2;
            const y = (detailedMapCanvas.height - height) / 2;
            
            canvasContext.clearRect(0, 0, detailedMapCanvas.width, detailedMapCanvas.height);
            canvasContext.drawImage(img, x, y, width, height);
        };
        img.onerror = function() {
            console.error('Erro ao carregar imagem para o canvas');
            canvasContext.fillStyle = 'var(--accent-color)';
            canvasContext.fillRect(0, 0, detailedMapCanvas.width, detailedMapCanvas.height);
        };
        img.src = currentMapImage;
    } else {
        canvasContext.fillStyle = 'var(--accent-color)';
        canvasContext.fillRect(0, 0, detailedMapCanvas.width, detailedMapCanvas.height);
    }
}

// Função para desenhar grade (Omitida para brevidade...)
function drawGrid() {
    const gridSize = 50;
    const width = detailedMapCanvas.width;
    const height = detailedMapCanvas.height;
    
    mapGrid.innerHTML = '';
    
    // Linhas verticais
    for (let x = gridSize; x < width; x += gridSize) {
        const line = document.createElement('div');
        line.className = 'grid-line vertical';
        line.style.left = `${x}px`;
        mapGrid.appendChild(line);
        
        const label = document.createElement('div');
        label.className = 'grid-label';
        label.textContent = x;
        label.style.left = `${x}px`;
        label.style.top = '5px';
        mapGrid.appendChild(label);
    }
    
    // Linhas horizontales
    for (let y = gridSize; y < height; y += gridSize) {
        const line = document.createElement('div');
        line.className = 'grid-line horizontal';
        line.style.top = `${y}px`;
        mapGrid.appendChild(line);
        
        const label = document.createElement('div');
        label.className = 'grid-label';
        label.textContent = y;
        label.style.left = '5px';
        label.style.top = `${y}px`;
        mapGrid.appendChild(label);
    }
}

// Função para renderizar pontos no mapa detalhado (Omitida para brevidade...)
function renderDetailedPoints() {
    detailedMapPoints.innerHTML = '';
    
    mapPoints.forEach(point => {
        const detailedPoint = document.createElement('div');
        detailedPoint.className = `detailed-point ${point.type}-point`;
        
        // Converter coordenadas relativas para pixels no canvas
        const pixelX = (point.x / 100) * detailedMapCanvas.width;
        const pixelY = (point.y / 100) * detailedMapCanvas.height;
        
        detailedPoint.style.left = `${pixelX}px`;
        detailedPoint.style.top = `${pixelY}px`;
        detailedPoint.setAttribute('title', point.details.name);
        detailedPoint.setAttribute('data-id', point.id);
        
        if (point.type === 'zero') {
            detailedPoint.innerHTML = '⭐';
        } else {
            detailedPoint.innerHTML = '💜';
        }
        
        detailedPoint.addEventListener('click', () => {
            showArtifactDetails(point);
        });
        
        detailedMapPoints.appendChild(detailedPoint);
    });
}

// Função para lidar com movimento do mouse no canvas (Omitida para brevidade...)
function handleCanvasMouseMove(event) {
    const rect = detailedMapCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    coordinatesDisplay.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
}

// Função para lidar com clique no canvas (Omitida para brevidade...)
function handleCanvasClick(event) {
    if (!addingPointMode) return;
    
    const rect = detailedMapCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Converter para coordenadas relativas (para o mapa principal)
    const relX = (x / detailedMapCanvas.width) * 100;
    const relY = (y / detailedMapCanvas.height) * 100;
    
    if (addingPointMode === 'zero') {
        addZeroPoint(relX, relY);
    } else {
        // O MODAL APARECE IMEDIATAMENTE!
        addCommonPoint(relX, relY);
    }
}

// Função para alternar visibilidade da grade (Omitida para brevidade...)
function toggleGrid() {
    isGridVisible = !isGridVisible;
    mapGrid.style.display = isGridVisible ? 'block' : 'none';
    
    const gridBtn = document.getElementById('btnGridToggle');
    if (isGridVisible) {
        gridBtn.classList.add('active');
        showNotification('Grade ativada');
    } else {
        gridBtn.classList.remove('active');
        showNotification('Grade desativada');
    }
}

// Função para exportar dados (Omitida para brevidade...)
function exportData() {
    try {
        const exportData = {
            mapPoints: mapPoints,
            metadata: {
                exportDate: new Date().toISOString(),
                totalFindings: findingsCount,
                zeroPoints: zeroPointsCount,
                mapImage: currentMapImage ? 'base64_image' : 'sample',
                version: '1.0'
            }
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        // Criar link de download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `mapa-colaborativo-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Dados exportados com sucesso!');
    } catch (error) {
        console.error('Erro ao exportar:', error);
        showNotification('Erro ao exportar dados', 'error');
    }
}

// Event Listeners (Omitida para brevidade...)
btnAddMap.addEventListener('click', () => {
    mapModal.style.display = 'flex';
    mapModal.classList.add('active');
});

closeMapModal.addEventListener('click', () => {
    mapModal.style.display = 'none';
    mapModal.classList.remove('active');
});

closePointDetailsModal.addEventListener('click', () => {
    pointDetailsModal.style.display = 'none';
    pointDetailsModal.classList.remove('active');
    currentPhoto = null;
    editingPointId = null;
});

cancelPointDetails.addEventListener('click', () => {
    pointDetailsModal.style.display = 'none';
    pointDetailsModal.classList.remove('active');
    currentPhoto = null;
    editingPointId = null;
});

window.addEventListener('click', (e) => {
    if (e.target === mapModal) {
        mapModal.style.display = 'none';
        mapModal.classList.remove('active');
    }
    if (e.target === pointDetailsModal) {
        pointDetailsModal.style.display = 'none';
        pointDetailsModal.classList.remove('active');
        currentPhoto = null;
        editingPointId = null;
    }
});

mapArea.addEventListener('click', () => {
    if (isMapLoaded) {
        saveCurrentMapState(); // Salvar antes de ir para a tela detalhada
        mainScreen.classList.remove('active');
        mapDetailScreen.classList.add('active');
        setTimeout(() => {
            initializeDetailedMap();
        }, 100);
    }
});

backButton.addEventListener('click', () => {
    saveCurrentMapState(); // Salvar antes de voltar para a tela principal
    deactivateAddingMode();
    mapDetailScreen.classList.remove('active');
    mainScreen.classList.add('active');
});

optionGallery.addEventListener('click', openImageGallery);
optionFiles.addEventListener('click', openFileSelector);

btnAddZeroPoint.addEventListener('click', () => {
    activateAddingMode('zero');
});

btnAddCommonPoint.addEventListener('click', () => {
    activateAddingMode('common');
});

cancelAddMode.addEventListener('click', deactivateAddingMode);

fileInput.addEventListener('change', handleImageSelection);
imageInput.addEventListener('change', handleImageSelection);

pointPhoto.addEventListener('change', handlePhotoUpload);

pointTags.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
        tag.classList.toggle('selected');
    });
});

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        setActiveTab(tab);
        
        if (tab.id === 'tabHome') {
            showNotification('Página inicial');
        } else if (tab.id === 'tabCatalog') {
            showNotification('Catálogo de artefatos');
        } else if (tab.id === 'tabSettings') {
            showNotification('Configurações');
        }
    });
});

document.getElementById('btnGridToggle').addEventListener('click', toggleGrid);
document.getElementById('btnExport').addEventListener('click', exportData);

// Inicialização
window.addEventListener('beforeunload', saveCurrentMapState); 

document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicação inicializada');
    loadCurrentMapFromStorage(); // Tenta carregar o mapa ao iniciar a tela.
    updateLastUpdateTime();
});

document.addEventListener('touchmove', function(e) {
    if (e.scale !== 1) {
        e.preventDefault();
    }
}, { passive: false });