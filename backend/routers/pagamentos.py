# app/backend/routers/pagamentos.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List
import os
import mercadopago

from backend.models.pagamento import Pagamento, PagamentoCreate, MetodoPagamento, StatusPagamento
from backend.utils.parse_client import parse_client
from backend.routers.auth import get_current_user

router = APIRouter()

# Inicializa o SDK do Mercado Pago
mp_sdk = mercadopago.SDK(os.getenv("MP_ACCESS_TOKEN"))

@router.post("", response_model=Pagamento)
async def create_pagamento(
    pagamento: PagamentoCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        data = pagamento.dict()
        
        if pagamento.metodo_pagamento == MetodoPagamento.pix:
            # Lógica para PIX
            payment_data = {
                "transaction_amount": pagamento.valor_final,
                "description": f"Pagamento Agendamento {pagamento.agendamento_id}",
                "payment_method_id": "pix",
                "payer": {
                    "email": current_user["email"] # Usar o email do usuário logado
                }
            }
            mp_payment = mp_sdk.payment().create(payment_data)
            
            if mp_payment["status"] == 201: # Created
                mp_response = mp_payment["response"]
                data["status"] = StatusPagamento.pendente # PIX é pendente até ser pago
                data["transacao_id"] = mp_response["id"]
                # Você pode armazenar o QR code e o link para o frontend aqui
                # mp_response["point_of_interaction"]["transaction_data"]["qr_code"]
                # mp_response["point_of_interaction"]["transaction_data"]["qr_code_base64"]
                # mp_response["point_of_interaction"]["transaction_data"]["ticket_url"]
            else:
                raise HTTPException(status_code=400, detail=f"Erro ao criar pagamento PIX: {mp_payment['response']}")
        
        elif pagamento.metodo_pagamento in [MetodoPagamento.credito, MetodoPagamento.debito]:
            # Lógica para Cartão (token já gerado no frontend)
            # Assumindo que o token do cartão virá no campo transacao_id
            if not pagamento.transacao_id:
                raise HTTPException(status_code=400, detail="Token do cartão não fornecido.")
            
            payment_data = {
                "transaction_amount": pagamento.valor_final,
                "token": pagamento.transacao_id, # Token do cartão
                "description": f"Pagamento Agendamento {pagamento.agendamento_id}",
                "installments": 1, # Número de parcelas, pode ser dinâmico
                "payment_method_id": "visa", # Exemplo, pode ser dinâmico
                "payer": {
                    "email": current_user["email"]
                }
            }
            mp_payment = mp_sdk.payment().create(payment_data)
            
            if mp_payment["status"] == 201: # Created
                mp_response = mp_payment["response"]
                if mp_response["status"] == "approved":
                    data["status"] = StatusPagamento.pago
                else:
                    data["status"] = StatusPagamento.pendente # Ou outro status de erro
                data["transacao_id"] = mp_response["id"]
            else:
                raise HTTPException(status_code=400, detail=f"Erro ao criar pagamento com cartão: {mp_payment['response']}")
        
        else: # Dinheiro
            data["status"] = StatusPagamento.pago # Pagamento em dinheiro é considerado pago na hora
            
        data["data_pagamento"] = datetime.now().isoformat() # Define a data do pagamento
        result = parse_client.create_object("Pagamento", data)
        return Pagamento(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
