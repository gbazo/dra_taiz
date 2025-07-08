document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const agendamentoId = urlParams.get('agendamentoId');

    if (agendamentoId) {
        // Carregar detalhes do agendamento
    }

    const mp = new MercadoPago('SUA_PUBLIC_KEY');

    // Lógica para o formulário de pagamento
});