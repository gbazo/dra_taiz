// app/frontend/js/main.js

// API Base URL
// Sempre força HTTPS em produção
let API_URL;
if (window.location.hostname.includes('b4a.run') || window.location.hostname.includes('back4app')) {
    // Força HTTPS em produção
    API_URL = `https://${window.location.host}/api`;
} else if (window.location.protocol === 'https:') {
    // Se já está em HTTPS, mantém
    API_URL = `https://${window.location.host}/api`;
} else {
    // Apenas em desenvolvimento local permite HTTP
    API_URL = `http://${window.location.host}/api`;
}

// Debug - remover depois de resolver o problema
console.log('Current hostname:', window.location.hostname);
console.log('Current host:', window.location.host);
console.log('Current protocol:', window.location.protocol);
console.log('API URL:', API_URL);

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// API Request helper
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        }
    };
    
    // Debug - remover depois
    const fullUrl = `${API_URL}${endpoint}`;
    console.log('Making request to:', fullUrl);
    
    const response = await fetch(fullUrl, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });
    
    if (response.status === 401) {
        logout();
        return;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.detail || 'Erro na requisição');
    }
    
    return data;
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Format datetime
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
}

// Load Dashboard
async function loadDashboard() {
    try {
        // Load today's appointments
        const today = new Date().toISOString().split('T')[0];
        const agendamentos = await apiRequest(`/agendamentos?data_inicio=${today}&data_fim=${today}`);
        
        const agendamentosHoje = document.getElementById('agendamentos-hoje');
        if (agendamentos.length === 0) {
            agendamentosHoje.innerHTML = '<p>Nenhum agendamento para hoje</p>';
        } else {
            agendamentosHoje.innerHTML = agendamentos.map(ag => `
                <div class="appointment-item">
                    <strong>${formatDateTime(ag.data_hora)}</strong> - 
                    ${ag.cliente_nome || 'Cliente'} - 
                    ${ag.procedimento_nome || 'Procedimento'}
                </div>
            `).join('');
        }
        
        // Load next appointments
        const proximosAtendimentos = await apiRequest('/agendamentos?limit=5');
        const proximosContainer = document.getElementById('proximos-atendimentos');
        if (proximosAtendimentos.length === 0) {
            proximosContainer.innerHTML = '<p>Nenhum agendamento próximo</p>';
        } else {
            proximosContainer.innerHTML = proximosAtendimentos.map(ag => `
                <div class="appointment-item">
                    <strong>${formatDateTime(ag.data_hora)}</strong> - 
                    ${ag.cliente_nome || 'Cliente'}
                </div>
            `).join('');
        }
        
        // Load statistics
        const clientes = await apiRequest('/clientes');
        document.getElementById('total-clientes').textContent = clientes.length;
        
        // Load monthly appointments
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
        
        const agendamentosMes = await apiRequest(
            `/agendamentos?data_inicio=${startOfMonth.toISOString().split('T')[0]}&data_fim=${endOfMonth.toISOString().split('T')[0]}`
        );
        document.getElementById('atendimentos-mes').textContent = agendamentosMes.length;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Initialize
checkAuth();

// Close modals on click outside
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
}