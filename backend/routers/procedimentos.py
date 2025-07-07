# app/backend/routers/procedimentos.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List

from ..models.procedimento import Procedimento, ProcedimentoCreate, ProcedimentoUpdate
from ..utils.parse_client import parse_client
from .auth import get_current_user

router = APIRouter()

@router.post("/", response_model=Procedimento)
async def create_procedimento(
    procedimento: ProcedimentoCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        data = procedimento.dict()
        data["criado_por"] = current_user["objectId"]
        
        result = parse_client.create_object("Procedimento", data)
        return Procedimento(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[Procedimento])
async def list_procedimentos(
    current_user: dict = Depends(get_current_user)
):
    try:
        results = parse_client.query_objects("Procedimento", order="nome")
        return [Procedimento(**proc) for proc in results]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{procedimento_id}", response_model=Procedimento)
async def get_procedimento(
    procedimento_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = parse_client.get_object("Procedimento", procedimento_id)
        return Procedimento(**result)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Procedimento not found")

@router.put("/{procedimento_id}", response_model=Procedimento)
async def update_procedimento(
    procedimento_id: str,
    procedimento: ProcedimentoUpdate,
    current_user: dict = Depends(get_current_user)
):
    try:
        update_data = {k: v for k, v in procedimento.dict().items() if v is not None}
        parse_client.update_object("Procedimento", procedimento_id, update_data)
        
        result = parse_client.get_object("Procedimento", procedimento_id)
        return Procedimento(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{procedimento_id}")
async def delete_procedimento(
    procedimento_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        parse_client.delete_object("Procedimento", procedimento_id)
        return {"message": "Procedimento deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))