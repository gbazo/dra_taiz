# app/backend/routers/fichas.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List

from backend.models.ficha_anamnese import FichaAnamnese, FichaAnamneseCreate, FichaAnamneseUpdate
from backend.utils.parse_client import parse_client
from backend.routers.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=FichaAnamnese)
async def create_ficha(
    ficha: FichaAnamneseCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        data = ficha.dict()
        data["data_preenchimento"] = data["data_preenchimento"].isoformat()
        data["preenchida_por"] = current_user["objectId"]
        
        result = parse_client.create_object("FichaAnamnese", data)
        return FichaAnamnese(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/cliente/{cliente_id}", response_model=List[FichaAnamnese])
async def list_fichas_cliente(
    cliente_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        where = {"cliente_id": cliente_id}
        results = parse_client.query_objects("FichaAnamnese", where=where, order="-createdAt")
        return [FichaAnamnese(**ficha) for ficha in results]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{ficha_id}", response_model=FichaAnamnese)
async def get_ficha(
    ficha_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = parse_client.get_object("FichaAnamnese", ficha_id)
        return FichaAnamnese(**result)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Ficha not found")

@router.put("/{ficha_id}", response_model=FichaAnamnese)
async def update_ficha(
    ficha_id: str,
    ficha: FichaAnamneseUpdate,
    current_user: dict = Depends(get_current_user)
):
    try:
        update_data = {k: v for k, v in ficha.dict().items() if v is not None}
        parse_client.update_object("FichaAnamnese", ficha_id, update_data)
        
        result = parse_client.get_object("FichaAnamnese", ficha_id)
        return FichaAnamnese(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))