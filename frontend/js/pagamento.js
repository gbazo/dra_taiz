document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const agendamentoId = urlParams.get('agendamentoId');

    const detalhesAgendamentoDiv = document.getElementById('detalhes-agendamento');
    const formPagamento = document.getElementById('form-pagamento');
    const descontoInput = document.getElementById('desconto');
    const acrescimoInput = document.getElementById('acrescimo');
    const metodoPagamentoSelect = document.getElementById('metodo-pagamento');
    const formCartaoDiv = document.getElementById('form-cartao');

    let agendamento = null;
    let procedimento = null;
    let valorProcedimentoOriginal = 0;

    // Substitua 'SUA_PUBLIC_KEY' pela sua Public Key do Mercado Pago
    const mp = new MercadoPago('TEST-5a80fd90-e816-4cab-b103-b372b0adbef9');

    if (agendamentoId) {
        try {
            agendamento = await apiRequest(`/agendamentos/${agendamentoId}`);
            procedimento = await apiRequest(`/procedimentos/${agendamento.procedimento_id}`);
            const cliente = await apiRequest(`/clientes/${agendamento.cliente_id}`);
            valorProcedimentoOriginal = procedimento.valor;

            detalhesAgendamentoDiv.innerHTML = `
                <p><strong>Cliente:</strong> ${cliente.nome_completo}</p>
                <p><strong>Procedimento:</strong> ${procedimento.nome}</p>
                <p><strong>Valor Original:</strong> R$ ${valorProcedimentoOriginal.toFixed(2)}</p>
            `;

            // Inicializa os campos de desconto e acréscimo
            descontoInput.value = 0;
            acrescimoInput.value = 0;

            // Adiciona listeners para recalcular o valor final
            descontoInput.addEventListener('input', calcularValorFinal);
            acrescimoInput.addEventListener('input', calcularValorFinal);
            metodoPagamentoSelect.addEventListener('change', toggleFormCartao);

            calcularValorFinal(); // Calcula o valor inicial

        } catch (error) {
            console.error('Erro ao carregar detalhes do agendamento/procedimento:', error);
            detalhesAgendamentoDiv.innerHTML = '<p>Erro ao carregar detalhes.</p>';
        }
    }

    function calcularValorFinal() {
        const desconto = parseFloat(descontoInput.value) || 0;
        const acrescimo = parseFloat(acrescimoInput.value) || 0;
        const valorFinal = valorProcedimentoOriginal - desconto + acrescimo;
        // Atualizar algum elemento na tela com o valor final, se houver
        console.log('Valor Final:', valorFinal.toFixed(2));
    }

    function toggleFormCartao() {
        if (metodoPagamentoSelect.value === 'credito' || metodoPagamentoSelect.value === 'debito') {
            formCartaoDiv.style.display = 'block';
            // Renderizar o formulário de cartão do Mercado Pago
            renderMercadoPagoCardForm();
        } else {
            formCartaoDiv.style.display = 'none';
        }
    }

    function renderMercadoPagoCardForm() {
        const cardForm = mp.cardForm({
            amount: "100.00", // Este valor será atualizado dinamicamente
            autoMount: true,
            form: {
                id: "form-cartao",
                cardNumber: {
                    id: "form-checkout__cardNumber",
                    placeholder: "Número do cartão",
                },
                expirationDate: {
                    id: "form-checkout__expirationDate",
                    placeholder: "MM/YY",
                },
                securityCode: {
                    id: "form-checkout__securityCode",
                    placeholder: "Código de segurança",
                },
                cardholderName: {
                    id: "form-checkout__cardholderName",
                    placeholder: "Nome e sobrenome",
                },
                issuer: {
                    id: "form-checkout__issuer",
                    placeholder: "Banco emissor",
                },
                installments: {
                    id: "form-checkout__installments",
                    placeholder: "Parcelas",
                },
                cardholderEmail: {
                    id: "form-checkout__cardholderEmail",
                    placeholder: "E-mail",
                },
            },
            callbacks: {
                onFormMounted: error => {
                    if (error) return console.warn("Form Mounted handling error: ", error);
                    console.log("Form mounted");
                },
                onSubmit: event => {
                    event.preventDefault();
                    const cardData = cardForm.get = cardForm.get = cardForm.getCardFormData();
                    // Aqui você enviaria os dados do cartão para o seu backend
                    // cardData.token, cardData.paymentMethodId, cardData.issuerId, cardData.installments
                    console.log("Dados do cartão para envio:", cardData);
                    processPayment(cardData.token);
                },
                onFetching: (resource) => {
                    console.log("Fetching resource: ", resource);
                    // const progressBar = document.querySelector(".progress-bar");
                    // progressBar.style.width = `${resource.progress}%`;
                }
            },
        });
    }

    formPagamento.addEventListener('submit', async (event) => {
        event.preventDefault();
        const metodo = metodoPagamentoSelect.value;

        if (metodo === 'dinheiro' || metodo === 'pix') {
            processPayment(null); // Para dinheiro e PIX, não há token de cartão
        } else if (metodo === 'credito' || metodo === 'debito') {
            // Para cartão, a submissão é tratada pelo cardForm.onSubmit do Mercado Pago
            // Não fazemos nada aqui para evitar submissão duplicada
        }
    });

    async function processPayment(cardToken = null) {
        const metodo = metodoPagamentoSelect.value;
        const desconto = parseFloat(descontoInput.value) || 0;
        const acrescimo = parseFloat(acrescimoInput.value) || 0;
        const valorFinal = valorProcedimentoOriginal - desconto + acrescimo;

        const pagamentoData = {
            agendamento_id: agendamentoId,
            valor_procedimento: valorProcedimentoOriginal,
            desconto: desconto,
            acrescimo: acrescimo,
            valor_final: valorFinal,
            metodo_pagamento: metodo,
            transacao_id: cardToken // Para cartão, será o token; para PIX/Dinheiro, será null
        };

        try {
            const result = await apiRequest('/pagamentos', {
                method: 'POST',
                body: JSON.stringify(pagamentoData)
            });
            alert('Pagamento registrado com sucesso!');
            window.location.href = '/dashboard'; // Redireciona para o dashboard
        } catch (error) {
            alert('Erro ao registrar pagamento: ' + error.message);
            console.error('Erro ao registrar pagamento:', error);
        }
    }
});