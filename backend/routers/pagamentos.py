# app/backend/routers/pagamentos.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List

from backend.models.pagamento import Pagamento, PagamentoCreate
from backend.utils.parse_client import parse_client
from backend.routers.auth import get_current_user

router = APIRouter()

@router.post("", response_model=Pagamento)
async def create_pagamento(
    pagamento: PagamentoCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Lógica de pagamento com Mercado Pago virá aqui
        data = pagamento.dict()
        result = parse_client.create_object("Pagamento", data)
        return Pagamento(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
