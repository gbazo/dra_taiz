// app/frontend/js/fichas.js

let currentClienteId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/ficha/')) {
        const pathParts = window.location.pathname.split('/');
        currentClienteId = pathParts[pathParts.length - 1];
        loadClienteInfo();
        loadHistoricoFichas();
    }
});

async function loadClienteInfo() {
    try {
        const cliente = await apiRequest(`/clientes/${currentClienteId}`);
        document.getElementById('cliente-info').innerHTML = `
            <strong>Cliente:</strong> ${cliente.nome_completo} | 
            <strong>Telefone:</strong> ${cliente.telefone} | 
            <strong>Email:</strong> ${cliente.email}
        `;
    } catch (error) {
        console.error('Error loading cliente info:', error);
    }
}

async function loadHistoricoFichas() {
    try {
        const fichas = await apiRequest(`/fichas/cliente/${currentClienteId}`);
        const container = document.getElementById('historicoFichas');
        
        if (fichas.length === 0) {
            container.innerHTML = '<p>Nenhuma ficha cadastrada</p>';
            return;
        }
        
        container.innerHTML = fichas.map(ficha => `
            <div class="ficha-item" onclick="viewFicha('${ficha.objectId}')">
                <h4>Ficha de ${formatDate(ficha.data_preenchimento)}</h4>
                <p>Altura: ${ficha.altura}cm | Peso: ${ficha.peso}kg | Idade: ${ficha.idade} anos</p>
                <p>Profissão: ${ficha.profissao}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading fichas:', error);
    }
}

function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

async function salvarFicha(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const ficha = {
        cliente_id: currentClienteId,
        altura: parseFloat(formData.get('altura')),
        peso: parseFloat(formData.get('peso')),
        idade: parseInt(formData.get('idade')),
        profissao: formData.get('profissao'),
        historico_saude: {
            doencas: formData.get('doencas').split(',').map(s => s.trim()).filter(s => s),
            alergias: formData.get('alergias').split(',').map(s => s.trim()).filter(s => s),
            medicamentos: formData.get('medicamentos').split(',').map(s => s.trim()).filter(s => s),
            cirurgias: formData.get('cirurgias').split(',').map(s => s.trim()).filter(s => s)
        },
        historico_estetico: formData.get('historico_estetico'),
        habitos_vida: formData.get('habitos_vida'),
        contraindicacoes: formData.get('contraindicacoes'),
        consentimento_aceito: formData.get('consentimento_aceito') === 'on',
        data_preenchimento: new Date().toISOString()
    };
    
    try {
        await apiRequest('/fichas', {
            method: 'POST',
            body: JSON.stringify(ficha)
        });
        
        alert('Ficha salva com sucesso!');
        document.getElementById('formAnamnese').reset();
        loadHistoricoFichas();
        showTab('historico');
    } catch (error) {
        alert('Erro ao salvar ficha: ' + error.message);
    }
}

async function viewFicha(fichaId) {
    // Implement view ficha details
    alert('Visualizar ficha: ' + fichaId);
}