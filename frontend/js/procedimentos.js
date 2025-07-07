// app/frontend/js/procedimentos.js

let allProcedimentos = [];

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/procedimentos')) {
        loadProcedimentos();
    }
});

async function loadProcedimentos() {
    try {
        const procedimentos = await apiRequest('/procedimentos');
        allProcedimentos = procedimentos;
        renderProcedimentos(procedimentos);
    } catch (error) {
        console.error('Error loading procedimentos:', error);
        const tbody = document.getElementById('procedimentosTableBody');
        tbody.innerHTML = `<tr><td colspan="4" class="text-center error-message">Erro ao carregar procedimentos: ${error.message}</td></tr>`;
    }
}

function renderProcedimentos(procedimentos) {
    const tbody = document.getElementById('procedimentosTableBody');
    
    if (procedimentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum procedimento cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = procedimentos.map(proc => `
        <tr>
            <td>${proc.nome}</td>
            <td>${proc.descricao || '-'}</td>
            <td>${proc.valor ? `R$ ${proc.valor.toFixed(2)}` : '-'}</td>
            <td>${proc.duracao_minutos || '-'}</td>
            <td>
                <button onclick="editProcedimento('${proc.objectId}')" class="btn btn-sm btn-secondary">Editar</button>
                <button onclick="deleteProcedimento('${proc.objectId}')" class="btn btn-sm btn-danger">Excluir</button>
            </td>
        </tr>
    `).join('');
}

function searchProcedimentos() {
    const searchTerm = document.getElementById('searchProcedimentos').value.toLowerCase();
    const filtered = allProcedimentos.filter(proc => 
        proc.nome.toLowerCase().includes(searchTerm) ||
        (proc.descricao && proc.descricao.toLowerCase().includes(searchTerm))
    );
    renderProcedimentos(filtered);
}

function openModalNovoProcedimento() {
    document.getElementById('formProcedimento').reset();
    document.getElementById('procedimentoId').value = '';
    document.getElementById('modalTitle').textContent = 'Novo Procedimento';
    openModal('modalProcedimento');
}

async function salvarProcedimento(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const procedimento = Object.fromEntries(formData);
    
    // Convert valor to float and duracao_minutos to int
    if (procedimento.valor) {
        procedimento.valor = parseFloat(procedimento.valor);
    }
    if (procedimento.duracao_minutos) {
        procedimento.duracao_minutos = parseInt(procedimento.duracao_minutos);
    }
    
    const procedimentoId = document.getElementById('procedimentoId').value;
    
    try {
        if (procedimentoId) {
            await apiRequest(`/procedimentos/${procedimentoId}`, {
                method: 'PUT',
                body: JSON.stringify(procedimento)
            });
            alert('Procedimento atualizado com sucesso!');
        } else {
            await apiRequest('/procedimentos', {
                method: 'POST',
                body: JSON.stringify(procedimento)
            });
            alert('Procedimento cadastrado com sucesso!');
        }
        
        closeModal('modalProcedimento');
        loadProcedimentos();
    } catch (error) {
        console.error('Error saving procedimento:', error);
        alert('Erro ao salvar procedimento: ' + error.message);
    }
}

async function editProcedimento(procedimentoId) {
    try {
        const proc = await apiRequest(`/procedimentos/${procedimentoId}`);
        document.getElementById('procedimentoId').value = proc.objectId;
        document.getElementById('nome').value = proc.nome;
        document.getElementById('descricao').value = proc.descricao || '';
        document.getElementById('valor').value = proc.valor || '';
        document.getElementById('duracao_minutos').value = proc.duracao_minutos || '';
        document.getElementById('modalTitle').textContent = 'Editar Procedimento';
        openModal('modalProcedimento');
    } catch (error) {
        console.error('Error loading procedimento for edit:', error);
        alert('Erro ao carregar procedimento para edição: ' + error.message);
    }
}

async function deleteProcedimento(procedimentoId) {
    if (confirm('Tem certeza que deseja excluir este procedimento?')) {
        try {
            await apiRequest(`/procedimentos/${procedimentoId}`, {
                method: 'DELETE'
            });
            alert('Procedimento excluído com sucesso!');
            loadProcedimentos();
        } catch (error) {
            console.error('Error deleting procedimento:', error);
            alert('Erro ao excluir procedimento: ' + error.message);
        }
    }
}