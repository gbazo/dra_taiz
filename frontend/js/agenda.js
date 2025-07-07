// app/frontend/js/agenda.js

let currentView = 'day';
let currentDate = new Date();
let procedimentos = [];
let profissionais = [];

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/agenda')) {
        document.getElementById('currentDate').value = currentDate.toISOString().split('T')[0];
        loadProcedimentos();
        loadProfissionais();
        loadClientes();
        loadAgenda();
    }
});

async function loadProcedimentos() {
    try {
        procedimentos = await apiRequest('/procedimentos');
        const select = document.getElementById('selectProcedimento');
        select.innerHTML = '<option value="">Selecione o procedimento</option>' +
            procedimentos.map(p => `<option value="${p.objectId}" data-duracao="${p.duracao_minutos}">${p.nome}</option>`).join('');
    } catch (error) {
        console.error('Error loading procedimentos:', error);
    }
}

async function loadProfissionais() {
    try {
        // For now, use current user as profissional
        const user = JSON.parse(localStorage.getItem('user'));
        profissionais = [user];
        
        const selectModal = document.getElementById('selectProfissional');
        selectModal.innerHTML = profissionais.map(p => 
            `<option value="${p.objectId}">${p.nome_completo || p.username}</option>`
        ).join('');
        
        const selectFilter = document.getElementById('filterProfissional');
        selectFilter.innerHTML = '<option value="">Todos os profissionais</option>' +
            profissionais.map(p => `<option value="${p.objectId}">${p.nome_completo || p.username}</option>`).join('');
    } catch (error) {
        console.error('Error loading profissionais:', error);
    }
}

async function loadClientes() {
    try {
        const clientes = await apiRequest('/clientes');
        const select = document.getElementById('selectCliente');
        select.innerHTML = '<option value="">Selecione o cliente</option>' +
            clientes.map(c => `<option value="${c.objectId}">${c.nome_completo}</option>`).join('');
    } catch (error) {
        console.error('Error loading clientes:', error);
    }
}

async function loadAgenda() {
    try {
        const startDate = currentView === 'day' ? currentDate : getWeekStart(currentDate);
        const endDate = currentView === 'day' ? currentDate : getWeekEnd(currentDate);
        
        const profissionalId = document.getElementById('filterProfissional').value;
        let url = `/agendamentos?data_inicio=${startDate.toISOString().split('T')[0]}&data_fim=${endDate.toISOString().split('T')[0]}`;
        
        if (profissionalId) {
            url += `&profissional_id=${profissionalId}`;
        }
        
        const agendamentos = await apiRequest(url);
        renderAgenda(agendamentos);
    } catch (error) {
        console.error('Error loading agenda:', error);
    }
}

function renderAgenda(agendamentos) {
    const container = document.getElementById('agendaContainer');
    
    if (currentView === 'day') {
        renderDayView(container, agendamentos);
    } else {
        renderWeekView(container, agendamentos);
    }
}

function renderDayView(container, agendamentos) {
    const hours = Array.from({length: 13}, (_, i) => i + 8); // 8:00 to 20:00
    
    container.innerHTML = `
        <div class="agenda-day">
            <h3>${currentDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
            ${hours.map(hour => {
                const hourAppointments = agendamentos.filter(ag => 
                    new Date(ag.data_hora).getHours() === hour
                );
                
                return `
                    <div class="time-slot">
                        <span class="time-label">${hour}:00</span>
                        ${hourAppointments.map(ag => `
                            <div class="appointment ${ag.status}" onclick="viewAgendamento('${ag.objectId}')">
                                ${new Date(ag.data_hora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} - 
                                ${ag.cliente_nome || 'Cliente'} - 
                                ${ag.procedimento_nome || 'Procedimento'}
                            </div>
                        `).join('')}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderWeekView(container, agendamentos) {
    // Implement week view
    container.innerHTML = '<p>Visão semanal em desenvolvimento</p>';
}

function changeView() {
    currentView = document.getElementById('viewType').value;
    loadAgenda();
}

function previousWeek() {
    currentDate.setDate(currentDate.getDate() - 7);
    document.getElementById('currentDate').value = currentDate.toISOString().split('T')[0];
    loadAgenda();
}

function nextWeek() {
    currentDate.setDate(currentDate.getDate() + 7);
    document.getElementById('currentDate').value = currentDate.toISOString().split('T')[0];
    loadAgenda();
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

function getWeekEnd(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + 6;
    return new Date(d.setDate(diff));
}

function openModalNovoAgendamento() {
    document.getElementById('formNovoAgendamento').reset();
    openModal('modalNovoAgendamento');
}

function updateDuracao() {
    const select = document.getElementById('selectProcedimento');
    const duracao = select.options[select.selectedIndex].getAttribute('data-duracao');
    document.getElementById('duracaoMinutos').value = duracao || '';
}

async function salvarAgendamento(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = formData.get('data');
    const hora = formData.get('hora');
    
    const agendamento = {
        profissional_id: formData.get('profissional_id'),
        cliente_id: formData.get('cliente_id'),
        procedimento_id: formData.get('procedimento_id'),
        data_hora: `${data}T${hora}:00`,
        duracao_minutos: parseInt(formData.get('duracao_minutos')),
        observacoes: formData.get('observacoes'),
        status: 'confirmado'
    };
    
    try {
        await apiRequest('/agendamentos', {
            method: 'POST',
            body: JSON.stringify(agendamento)
        });
        
        closeModal('modalNovoAgendamento');
        loadAgenda();
        alert('Agendamento criado com sucesso!');
    } catch (error) {
        alert('Erro ao criar agendamento: ' + error.message);
    }
}

async function viewAgendamento(agendamentoId) {
    // Implement view/edit agendamento
    alert('Visualizar agendamento: ' + agendamentoId);
}