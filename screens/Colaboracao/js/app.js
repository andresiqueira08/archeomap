// archeomap-master/screens/Colaboracao/js/app.js

// --- VARIÁVEIS GLOBAIS ---
let currentMapId = localStorage.getItem('currentMapId');
let currentMapData = null;
let mapPoints = []; // Agora será sincronizado com o Firebase
let isMapLoaded = false;
let currentMapImage = null;
let canvasContext = null;
let isGridVisible = true;
let addingPointMode = null;
let editingPointId = null;

// Referências UI
const interactiveMap = document.getElementById('interactiveMap');
const mapPlaceholder = document.getElementById('mapPlaceholder');
const totalFindings = document.getElementById('totalFindings');
const zeroPoints = document.getElementById('zeroPoints');
const artifactsGrid = document.getElementById('artifactsGrid');
const mapArea = document.getElementById('mapArea');
const mapDetailScreen = document.querySelector('.map-detail-screen');
const mainScreen = document.querySelector('.main-screen');
const detailedMapCanvas = document.getElementById('detailedMapCanvas');
const detailedMapPoints = document.getElementById('detailedMapPoints');
const notification = document.getElementById('notification');

// Modais
const pointDetailsModal = document.getElementById('pointDetailsModal');
const pointName = document.getElementById('pointName');
const pointDescription = document.getElementById('pointDescription');
const pointCategory = document.getElementById('pointCategory');

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    if (!currentMapId) {
        alert("Nenhum mapa selecionado. Voltando para a galeria.");
        window.history.back();
        return;
    }

    // Carrega o mapa inicial (imagem e dados básicos)
    carregarMapaDoFirebase();
    
    // Inicia "escuta" em tempo real dos pontos
    iniciarSincronizacaoPontos();
});

function showNotification(msg) {
    notification.textContent = msg;
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 3000);
}

// --- FIREBASE: CARREGAMENTO DO MAPA ---
function carregarMapaDoFirebase() {
    const mapRef = database.ref('maps/' + currentMapId);
    
    mapRef.once('value').then((snapshot) => {
        const data = snapshot.val();
        if (!data) {
            alert("Mapa não encontrado!");
            window.history.back();
            return;
        }
        currentMapData = data;
        currentMapImage = data.image;
        
        // Configura a imagem de fundo
        interactiveMap.style.backgroundImage = `url(${currentMapImage})`;
        interactiveMap.style.backgroundSize = 'cover';
        interactiveMap.style.backgroundPosition = 'center';
        interactiveMap.style.display = 'block';
        
        mapPlaceholder.style.display = 'none';
        document.querySelector('.image').classList.add('has-map');
        isMapLoaded = true;
    });
}

// --- FIREBASE: SINCRONIZAÇÃO EM TEMPO REAL ---
function iniciarSincronizacaoPontos() {
    const pointsRef = database.ref(`maps/${currentMapId}/pointsData`);

    // Quando um ponto é ADICIONADO (por qualquer pessoa)
    pointsRef.on('child_added', (snapshot) => {
        const point = snapshot.val();
        point.id = snapshot.key; // Salva a chave do Firebase como ID
        mapPoints.push(point);
        renderizarPontoNaTela(point);
        atualizarContadores();
    });

    // Quando um ponto é ALTERADO
    pointsRef.on('child_changed', (snapshot) => {
        const updatedPoint = snapshot.val();
        updatedPoint.id = snapshot.key;
        
        // Atualiza no array local
        const index = mapPoints.findIndex(p => p.id === updatedPoint.id);
        if (index !== -1) {
            mapPoints[index] = updatedPoint;
            // Re-renderiza tudo (solução simples para atualizar UI)
            reRenderizarTudo();
        }
    });

    // Quando um ponto é REMOVIDO
    pointsRef.on('child_removed', (snapshot) => {
        const removedId = snapshot.key;
        mapPoints = mapPoints.filter(p => p.id !== removedId);
        reRenderizarTudo();
    });
}

// --- RENDERIZAÇÃO ---
function renderizarPontoNaTela(point) {
    // 1. Cria ponto no mapa pequeno (Tela Principal)
    const el = document.createElement('div');
    el.className = `map-point ${point.type}-point`;
    el.style.left = `${point.x}%`;
    el.style.top = `${point.y}%`;
    el.innerHTML = point.type === 'zero' ? '⭐' : '💜';
    el.setAttribute('data-id', point.id); // Importante para clicar
    
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        abrirModalEdicao(point);
    });
    
    interactiveMap.appendChild(el);

    // 2. Adiciona ao Grid de cards
    const card = document.createElement('div');
    card.className = 'artifact-card';
    card.innerHTML = `
        <div class="artifact-info">
            <div class="artifact-name">${point.details.name}</div>
            <div class="artifact-detail">📍 ${Math.round(point.x)}, ${Math.round(point.y)}</div>
            <div class="artifact-detail">${point.details.category || 'Sem categoria'}</div>
        </div>
    `;
    card.addEventListener('click', () => abrirModalEdicao(point));
    artifactsGrid.appendChild(card);

    // 3. Se estiver na tela detalhada, atualiza lá também
    if (mapDetailScreen.classList.contains('active')) {
        renderizarPontoDetalhado(point);
    }
}

function reRenderizarTudo() {
    // Limpa UI
    interactiveMap.innerHTML = '';
    artifactsGrid.innerHTML = '';
    detailedMapPoints.innerHTML = '';
    
    // Redesenha tudo baseado no array atualizado
    mapPoints.forEach(renderizarPontoNaTela);
    atualizarContadores();
}

function atualizarContadores() {
    const findings = mapPoints.filter(p => p.type !== 'zero').length;
    const zeros = mapPoints.filter(p => p.type === 'zero').length;
    totalFindings.textContent = findings;
    zeroPoints.textContent = zeros;
    
    // Atualiza contagem no objeto do mapa no Firebase também (para a galeria ver)
    database.ref(`maps/${currentMapId}`).update({ pointsCount: mapPoints.length });
}

// --- ADIÇÃO DE PONTOS (Envia para o Firebase) ---
function adicionarPontoNoFirebase(x, y, type) {
    const novoPonto = {
        x: x,
        y: y,
        type: type,
        createdBy: auth.currentUser ? auth.currentUser.email : 'anon',
        createdAt: new Date().toISOString(),
        details: {
            name: type === 'zero' ? 'Ponto Zero' : `Achado #${mapPoints.length + 1}`,
            description: '',
            category: 'outros'
        }
    };

    // Empurra para o Firebase. O 'child_added' vai capturar e desenhar na tela.
    database.ref(`maps/${currentMapId}/pointsData`).push(novoPonto)
        .then(() => {
            showNotification("Ponto salvo na nuvem!");
        })
        .catch(err => alert("Erro ao salvar: " + err.message));
}

// --- EDIÇÃO DE PONTOS ---
function abrirModalEdicao(point) {
    editingPointId = point.id;
    pointName.value = point.details.name;
    pointDescription.value = point.details.description || '';
    pointCategory.value = point.details.category || 'outros';
    
    pointDetailsModal.style.display = 'flex';
}

document.getElementById('savePointDetails').addEventListener('click', () => {
    if (!editingPointId) return;

    const updates = {
        "details/name": pointName.value,
        "details/description": pointDescription.value,
        "details/category": pointCategory.value
    };

    // Atualiza apenas os campos específicos no Firebase
    database.ref(`maps/${currentMapId}/pointsData/${editingPointId}`).update(updates)
        .then(() => {
            showNotification("Detalhes atualizados!");
            pointDetailsModal.style.display = 'none';
        });
});

document.getElementById('btnDeletePoint').addEventListener('click', () => {
    if (!editingPointId || !confirm("Tem certeza que deseja apagar este ponto para todos?")) return;
    
    database.ref(`maps/${currentMapId}/pointsData/${editingPointId}`).remove()
        .then(() => {
            showNotification("Ponto removido.");
            pointDetailsModal.style.display = 'none';
        });
});

// --- INTERAÇÃO COM MAPA DETALHADO (Canvas) ---
mapArea.addEventListener('click', () => {
    if (isMapLoaded) {
        mainScreen.classList.remove('active');
        mapDetailScreen.classList.add('active');
        inicializarCanvas();
    }
});

document.getElementById('backButton').addEventListener('click', () => {
    mapDetailScreen.classList.remove('active');
    mainScreen.classList.add('active');
    desativarModoAdicao();
});

function inicializarCanvas() {
    canvasContext = detailedMapCanvas.getContext('2d');
    const rect = detailedMapCanvas.parentElement.getBoundingClientRect();
    detailedMapCanvas.width = rect.width;
    detailedMapCanvas.height = rect.height;
    
    desenharImagemNoCanvas();
    renderizarPontosDetalhados();
}

function desenharImagemNoCanvas() {
    if (!currentMapImage) return;
    const img = new Image();
    img.src = currentMapImage;
    img.onload = () => {
        // Lógica simples de fit (ajuste)
        const scale = Math.min(detailedMapCanvas.width / img.width, detailedMapCanvas.height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (detailedMapCanvas.width - w) / 2;
        const y = (detailedMapCanvas.height - h) / 2;
        canvasContext.drawImage(img, x, y, w, h);
    };
}

function renderizarPontosDetalhados() {
    detailedMapPoints.innerHTML = '';
    mapPoints.forEach(renderizarPontoDetalhado);
}

function renderizarPontoDetalhado(point) {
    // Converte % para px
    const px = (point.x / 100) * detailedMapCanvas.width;
    const py = (point.y / 100) * detailedMapCanvas.height;
    
    const el = document.createElement('div');
    el.className = `detailed-point ${point.type}-point`;
    el.style.left = `${px}px`;
    el.style.top = `${py}px`;
    el.innerHTML = point.type === 'zero' ? '⭐' : '💜';
    
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        abrirModalEdicao(point);
    });
    
    detailedMapPoints.appendChild(el);
}

// --- MODO DE ADIÇÃO (Cliques no Canvas) ---
detailedMapCanvas.addEventListener('click', (e) => {
    if (!addingPointMode) return;
    
    const rect = detailedMapCanvas.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;
    
    // Converte px para % para salvar no banco (independente de resolução)
    const xPct = (xPx / detailedMapCanvas.width) * 100;
    const yPct = (yPx / detailedMapCanvas.height) * 100;
    
    adicionarPontoNoFirebase(xPct, yPct, addingPointMode);
    desativarModoAdicao();
});

function ativarModoAdicao(tipo) {
    addingPointMode = tipo;
    document.getElementById('addingModeIndicator').style.display = 'flex';
    detailedMapCanvas.style.cursor = 'crosshair';
}

function desativarModoAdicao() {
    addingPointMode = null;
    document.getElementById('addingModeIndicator').style.display = 'none';
    detailedMapCanvas.style.cursor = 'default';
}

// Botões de ferramentas
document.getElementById('btnAddZeroPoint').addEventListener('click', () => ativarModoAdicao('zero'));
document.getElementById('btnAddCommonPoint').addEventListener('click', () => ativarModoAdicao('common'));
document.getElementById('cancelAddMode').addEventListener('click', desativarModoAdicao);
document.getElementById('closePointDetailsModal').addEventListener('click', () => pointDetailsModal.style.display = 'none');

// Tabs (Voltar para galeria)
document.getElementById('tabGaleria').addEventListener('click', () => {
    window.history.back();
});