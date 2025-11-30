// archeomap-master/screens/Colaboracao/js/app.js

// --- VARIÁVEIS DE PERMISSÃO ---
// Recupera o usuário salvo no login para saber se é 'arqueologo' ou 'publico'
const localUser = JSON.parse(localStorage.getItem('user'));
const userType = localUser ? localUser.type : 'publico'; // Padrão é publico se der erro
const isArqueologo = userType === 'arqueologo';

// Recupera ID do mapa vindo da Galeria
const currentMapId = localStorage.getItem('currentMapId');

// Elementos da interface
const notification = document.getElementById('notification');
const interactiveMap = document.getElementById('interactiveMap');
const mapArea = document.getElementById('mapArea');
const mapPlaceholder = document.getElementById('mapPlaceholder');
const totalFindings = document.getElementById('totalFindings');
const zeroPoints = document.getElementById('zeroPoints');
const lastUpdate = document.getElementById('lastUpdate');
const artifactsGrid = document.getElementById('artifactsGrid');

// Elementos da tela do mapa detalhado (Canvas)
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

// Modais
const pointDetailsModal = document.getElementById('pointDetailsModal');
const closePointDetailsModal = document.getElementById('closePointDetailsModal');

// Elementos de detalhes do ponto (Inputs)
const pointName = document.getElementById('pointName');
const pointDescription = document.getElementById('pointDescription');
const pointCategory = document.getElementById('pointCategory');
const pointEra = document.getElementById('pointEra');
const pointState = document.getElementById('pointState');
const pointMaterial = document.getElementById('pointMaterial');
const pointCoordinates = document.getElementById('pointCoordinates');
const pointDiscoveryDate = document.getElementById('pointDiscoveryDate');
const pointTags = document.getElementById('pointTags');

// Botões de Ação do Modal
const savePointDetails = document.getElementById('savePointDetails');
const btnDeletePoint = document.getElementById('btnDeletePoint');

// Estado da aplicação
let mapPoints = []; // Sincronizado com Firebase
let isMapLoaded = false;
let currentMapImage = null;
let canvasContext = null;
let isGridVisible = true;
let addingPointMode = null;
let editingPointId = null;

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    if (!currentMapId) {
        alert("Erro: Nenhum mapa selecionado.");
        window.history.back();
        return;
    }
    
    // Configuração inicial de interface baseada no tipo de usuário
    aplicarPermissoesDeUsuario();

    carregarMapaFirebase();
    iniciarOuvintesFirebase();
});

// Função para esconder ferramentas de edição se for público
function aplicarPermissoesDeUsuario() {
    if (!isArqueologo) {
        // Esconde botões de adicionar pontos na tela detalhada
        if(btnAddZeroPoint) btnAddZeroPoint.style.display = 'none';
        if(btnAddCommonPoint) btnAddCommonPoint.style.display = 'none';
        
        // Remove indicadores de modo de adição se existirem
        if(addingModeIndicator) addingModeIndicator.remove();
        
        console.log("Modo Espectador Ativado: Usuário Público");
    }
}

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.background = type === 'success' ? 'var(--primary-color)' : 'var(--error-color)';
    setTimeout(() => { notification.style.display = 'none'; }, 3000);
}

// --- FIREBASE: CARREGAR DADOS ---

function carregarMapaFirebase() {
    const mapRef = database.ref('maps/' + currentMapId);
    mapRef.once('value').then((snapshot) => {
        const data = snapshot.val();
        if (data && data.image) {
            currentMapImage = data.image;
            loadMapVisuals(currentMapImage);
        } else {
            showNotification("Erro ao carregar imagem do mapa.", "error");
        }
    });
}

function iniciarOuvintesFirebase() {
    const pointsRef = database.ref(`maps/${currentMapId}/pointsData`);
    
    pointsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        mapPoints = [];
        
        if (data) {
            Object.keys(data).forEach(key => {
                mapPoints.push({
                    id: key,
                    ...data[key]
                });
            });
        }
        
        atualizarInterfaceGlobal();
    });
}

// --- LÓGICA DE INTERFACE ---

function loadMapVisuals(imageSrc) {
    interactiveMap.style.backgroundImage = `url(${imageSrc})`;
    interactiveMap.style.backgroundSize = 'cover';
    interactiveMap.style.backgroundPosition = 'center';
    
    mapPlaceholder.style.display = 'none';
    mapArea.classList.add('has-map');
    interactiveMap.style.display = 'block';
    isMapLoaded = true;
}

function atualizarInterfaceGlobal() {
    interactiveMap.innerHTML = ''; 
    artifactsGrid.innerHTML = '';
    detailedMapPoints.innerHTML = '';
    
    let findingsCount = 0;
    let zeroPointsCount = 0;

    mapPoints.forEach(point => {
        if (point.type === 'zero') zeroPointsCount++;
        else findingsCount++;

        renderPointOnMainMap(point);
        addArtifactToGrid(point);

        if (mapDetailScreen.classList.contains('active')) {
            renderDetailedPoint(point);
        }
    });

    totalFindings.textContent = findingsCount;
    zeroPoints.textContent = zeroPointsCount;
    lastUpdate.textContent = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
}

function renderPointOnMainMap(point) {
    const el = document.createElement('div');
    el.className = `map-point ${point.type}-point`;
    el.style.left = `${point.x}%`;
    el.style.top = `${point.y}%`;
    el.innerHTML = point.type === 'zero' ? '⭐' : '💜';
    el.setAttribute('title', point.details.name);
    
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        abrirModalEdicao(point);
    });
    interactiveMap.appendChild(el);
}

function addArtifactToGrid(point) {
    const card = document.createElement('div');
    card.className = 'artifact-card';
    
    let icon = '📦';
    if (point.details.category === 'ceramica') icon = '🏺';
    else if (point.details.category === 'metal') icon = '⚙️';
    else if (point.type === 'zero') icon = '⭐';

    card.innerHTML = `
        <div class="artifact-image"><div class="artifact-icon">${icon}</div></div>
        <div class="artifact-info">
            <div class="artifact-name">${point.details.name}</div>
            <div class="artifact-details">
                <div class="artifact-detail">📂 ${point.details.category || 'Geral'}</div>
                <div class="artifact-detail">📍 ${Math.round(point.x)}, ${Math.round(point.y)}</div>
            </div>
            <div class="artifact-tags">
                ${(point.details.tags || []).map(t => `<span class="artifact-tag">${t}</span>`).join('')}
            </div>
        </div>
    `;
    card.addEventListener('click', () => abrirModalEdicao(point));
    artifactsGrid.appendChild(card);
}

// --- MAPA DETALHADO (CANVAS) ---

mapArea.addEventListener('click', () => {
    if (isMapLoaded) {
        mainScreen.classList.remove('active');
        mapDetailScreen.classList.add('active');
        setTimeout(initializeDetailedMap, 100);
    }
});

backButton.addEventListener('click', () => {
    mapDetailScreen.classList.remove('active');
    mainScreen.classList.add('active');
    deactivateAddingMode();
});

function initializeDetailedMap() {
    canvasContext = detailedMapCanvas.getContext('2d');
    const container = detailedMapCanvas.parentElement;
    detailedMapCanvas.width = container.clientWidth;
    detailedMapCanvas.height = container.clientHeight;
    
    drawDetailedMap();
    if (isGridVisible) drawGrid();
    
    detailedMapPoints.innerHTML = '';
    mapPoints.forEach(renderDetailedPoint);
}

function drawDetailedMap() {
    canvasContext.clearRect(0, 0, detailedMapCanvas.width, detailedMapCanvas.height);
    if (currentMapImage) {
        const img = new Image();
        img.onload = function() {
            const scale = Math.min(detailedMapCanvas.width / img.width, detailedMapCanvas.height / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (detailedMapCanvas.width - w) / 2;
            const y = (detailedMapCanvas.height - h) / 2;
            canvasContext.drawImage(img, x, y, w, h);
        };
        img.src = currentMapImage;
    }
}

function renderDetailedPoint(point) {
    const el = document.createElement('div');
    el.className = `detailed-point ${point.type}-point`;
    const px = (point.x / 100) * detailedMapCanvas.width;
    const py = (point.y / 100) * detailedMapCanvas.height;
    
    el.style.left = `${px}px`;
    el.style.top = `${py}px`;
    el.innerHTML = point.type === 'zero' ? '⭐' : '💜';
    
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        abrirModalEdicao(point);
    });
    detailedMapPoints.appendChild(el);
}

// --- ADIÇÃO DE PONTOS ---

function activateAddingMode(type) {
    // BLOQUEIO DE SEGURANÇA EXTRA
    if (!isArqueologo) {
        showNotification("Apenas arqueólogos podem adicionar pontos.", "error");
        return;
    }

    addingPointMode = type;
    detailedMapCanvas.style.cursor = 'crosshair';
    addingModeIndicator.style.display = 'flex';
    addingModeText.textContent = type === 'zero' ? 'Clique para Ponto Zero' : 'Clique para Achado';
    showNotification(`Modo ${type === 'zero' ? 'Ponto Zero' : 'Achado'} ativado.`);
}

function deactivateAddingMode() {
    addingPointMode = null;
    detailedMapCanvas.style.cursor = 'default';
    if(addingModeIndicator) addingModeIndicator.style.display = 'none';
}

detailedMapCanvas.addEventListener('click', (event) => {
    // Se não for arqueólogo ou não estiver em modo de adição, ignora
    if (!addingPointMode || !isArqueologo) return;
    
    const rect = detailedMapCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const relX = (x / detailedMapCanvas.width) * 100;
    const relY = (y / detailedMapCanvas.height) * 100;
    
    if (addingPointMode === 'zero') {
        const altura = prompt('Digite a altitude do ponto zero (m):');
        if (altura) {
            salvarPontoNoFirebase(relX, relY, 'zero', { altitude: altura, name: 'Ponto Zero' });
        }
    } else {
        salvarPontoNoFirebase(relX, relY, 'common', { 
            name: `Achado #${mapPoints.length + 1}`,
            state: 'identificado'
        });
    }
    
    deactivateAddingMode();
});

function salvarPontoNoFirebase(x, y, type, extraDetails) {
    if (!isArqueologo) return; // Bloqueio final

    const novoPonto = {
        x: x, 
        y: y, 
        type: type,
        details: {
            name: 'Novo Item',
            category: 'outros',
            description: '',
            tags: [],
            discoveryDate: new Date().toISOString().split('T')[0],
            ...extraDetails
        },
        createdBy: localUser ? localUser.email : 'anon'
    };
    
    database.ref(`maps/${currentMapId}/pointsData`).push(novoPonto)
        .then(() => showNotification("Ponto salvo na nuvem!"))
        .catch(err => alert("Erro ao salvar: " + err.message));
}

// --- EDIÇÃO (MODAL COM PERMISSÕES) ---

function abrirModalEdicao(point) {
    editingPointId = point.id;
    
    // Preenche campos
    pointName.value = point.details.name || '';
    pointDescription.value = point.details.description || '';
    pointCategory.value = point.details.category || '';
    if(pointEra) pointEra.value = point.details.era || '';
    if(pointState) pointState.value = point.details.state || '';
    if(pointMaterial) pointMaterial.value = point.details.material || '';
    if(pointCoordinates) pointCoordinates.textContent = `X: ${Math.round(point.x)}, Y: ${Math.round(point.y)}`;
    if(pointDiscoveryDate) pointDiscoveryDate.value = point.details.discoveryDate || '';

    // Tags
    if(pointTags) {
        document.querySelectorAll('.tag').forEach(tag => {
            tag.classList.remove('selected');
            if (point.details.tags && point.details.tags.includes(tag.getAttribute('data-value'))) {
                tag.classList.add('selected');
            }
        });
    }

    // --- LÓGICA DE PERMISSÃO NO MODAL ---
    const inputs = pointDetailsModal.querySelectorAll('input, select, textarea');
    
    if (isArqueologo) {
        // Se for Arqueólogo: TUDO LIBERADO
        inputs.forEach(input => input.disabled = false);
        savePointDetails.style.display = 'block';
        btnDeletePoint.style.display = 'block';
        if(pointTags) pointTags.style.pointerEvents = 'auto'; // Habilita cliques nas tags
    } else {
        // Se for Público: SOMENTE LEITURA
        inputs.forEach(input => input.disabled = true);
        savePointDetails.style.display = 'none';
        btnDeletePoint.style.display = 'none';
        if(pointTags) pointTags.style.pointerEvents = 'none'; // Desabilita cliques nas tags
    }

    pointDetailsModal.style.display = 'flex';
}

// Botão Salvar (Só funciona se o botão estiver visível/clicável, mas adicionamos check extra)
savePointDetails.addEventListener('click', () => {
    if (!editingPointId || !isArqueologo) return;
    
    const selectedTags = [];
    if(pointTags) {
        document.querySelectorAll('.tag.selected').forEach(t => selectedTags.push(t.getAttribute('data-value')));
    }

    const updates = {
        name: pointName.value,
        description: pointDescription.value,
        category: pointCategory.value,
        era: pointEra ? pointEra.value : '',
        state: pointState ? pointState.value : '',
        material: pointMaterial ? pointMaterial.value : '',
        discoveryDate: pointDiscoveryDate ? pointDiscoveryDate.value : '',
        tags: selectedTags
    };
    
    database.ref(`maps/${currentMapId}/pointsData/${editingPointId}/details`).update(updates)
        .then(() => {
            showNotification("Atualizado!");
            pointDetailsModal.style.display = 'none';
        });
});

// Botão Excluir
btnDeletePoint.addEventListener('click', () => {
    if (!editingPointId || !isArqueologo) return;
    
    if (confirm("Apagar este ponto permanentemente?")) {
        database.ref(`maps/${currentMapId}/pointsData/${editingPointId}`).remove()
            .then(() => {
                showNotification("Ponto removido.");
                pointDetailsModal.style.display = 'none';
            });
    }
});

// --- UI HELPERS ---

// Grade
function drawGrid() {
    mapGrid.innerHTML = '';
    for (let i = 50; i < detailedMapCanvas.width; i += 50) {
        const line = document.createElement('div');
        line.className = 'grid-line vertical';
        line.style.left = i + 'px';
        mapGrid.appendChild(line);
    }
    for (let i = 50; i < detailedMapCanvas.height; i += 50) {
        const line = document.createElement('div');
        line.className = 'grid-line horizontal';
        line.style.top = i + 'px';
        mapGrid.appendChild(line);
    }
}

document.getElementById('btnGridToggle').addEventListener('click', () => {
    isGridVisible = !isGridVisible;
    mapGrid.style.display = isGridVisible ? 'block' : 'none';
});

// Tags selection
if(pointTags) {
    pointTags.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            if(isArqueologo) tag.classList.toggle('selected');
        });
    });
}

// Botões de ação (Eventos)
if(btnAddZeroPoint) btnAddZeroPoint.addEventListener('click', () => activateAddingMode('zero'));
if(btnAddCommonPoint) btnAddCommonPoint.addEventListener('click', () => activateAddingMode('common'));
if(cancelAddMode) cancelAddMode.addEventListener('click', deactivateAddingMode);
closePointDetailsModal.addEventListener('click', () => pointDetailsModal.style.display = 'none');