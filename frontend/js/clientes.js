// app/frontend/js/clientes.js

let allClientes = [];

// Load clients on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/clientes')) {
        loadClientes();
    }
});

async function loadClientes() {
    try {
        // Debug
        console.log('Loading clientes...');
        const clientes = await apiRequest('/clientes');
        allClientes = clientes;
        renderClientes(clientes);
    } catch (error) {
        console.error('Error loading clientes:', error);
        // Mostrar erro na interface
        const tbody = document.getElementById('clientesTableBody');
        tbody.innerHTML = `<tr><td colspan="5" class="text-center error-message">Erro ao carregar clientes: ${error.message}</td></tr>`;
    }
}

function renderClientes(clientes) {
    const tbody = document.getElementById('clientesTableBody');
    
    if (clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum cliente cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = clientes.map(cliente => `
        <tr>
            <td>${cliente.nome_completo}</td>
            <td>${cliente.telefone}</td>
            <td>${cliente.email}</td>
            <td>${formatDate(cliente.data_nascimento)}</td>
            <td>
                <a href="/ficha/${cliente.objectId}" class="btn btn-sm btn-primary">Ficha</a>
                <button onclick="editCliente('${cliente.objectId}')" class="btn btn-sm btn-secondary">Editar</button>
            </td>
        </tr>
    `).join('');
}

function searchClientes() {
    const searchTerm = document.getElementById('searchClientes').value.toLowerCase();
    const filtered = allClientes.filter(cliente => 
        cliente.nome_completo.toLowerCase().includes(searchTerm) ||
        cliente.telefone.includes(searchTerm) ||
        cliente.email.toLowerCase().includes(searchTerm)
    );
    renderClientes(filtered);
}

function openModalNovoCliente() {
    document.getElementById('formNovoCliente').reset();
    openModal('modalNovoCliente');
}

async function salvarCliente(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const cliente = Object.fromEntries(formData);

    // Format data_nascimento to YYYY-MM-DD
    if (cliente.data_nascimento) {
        cliente.data_nascimento = new Date(cliente.data_nascimento).toISOString().split('T')[0];
    }
    
    try {
        // Debug
        console.log('Saving cliente:', cliente);
        
        await apiRequest('/clientes', {
            method: 'POST',
            body: JSON.stringify(cliente)
        });
        
        closeModal('modalNovoCliente');
        loadClientes();
        alert('Cliente cadastrado com sucesso!');
    } catch (error) {
        console.error('Error saving cliente:', error);
        alert('Erro ao cadastrar cliente: ' + error.message);
    }
}

function editCliente(clienteId) {
    // TODO: Implementar edição
    alert('Função de edição em desenvolvimento');
}