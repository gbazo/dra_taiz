from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime

from backend.models.cliente import Cliente, ClienteCreate, ClienteUpdate
from backend.utils.parse_client import parse_client
from backend.routers.auth import get_current_user

router = APIRouter()

@router.post("", response_model=Cliente)
async def create_cliente(
    cliente: ClienteCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Convert date to ISO string for Parse
        data = cliente.dict()
        data["data_nascimento"] = data["data_nascimento"].isoformat()
        data["criado_por"] = current_user["objectId"]
        
        result = parse_client.create_object("Cliente", data)
        
        # Add created/updated timestamps and criado_por for response model validation
        result["createdAt"] = result.get("createdAt", datetime.now().isoformat())
        result["updatedAt"] = result.get("updatedAt", datetime.now().isoformat())
        result["criado_por"] = current_user["objectId"]
        
        return Cliente(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[Cliente])
async def list_clientes(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    try:
        results = parse_client.query_objects("Cliente", limit=limit, skip=skip, order="-createdAt")
        return [Cliente(**cliente) for cliente in results]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{cliente_id}", response_model=Cliente)
async def get_cliente(
    cliente_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = parse_client.get_object("Cliente", cliente_id)
        return Cliente(**result)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Cliente not found")

@router.put("/{cliente_id}", response_model=Cliente)
async def update_cliente(
    cliente_id: str,
    cliente: ClienteUpdate,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Filter out None values
        update_data = {k: v for k, v in cliente.dict().items() if v is not None}
        
        # Convert date if present
        if "data_nascimento" in update_data:
            update_data["data_nascimento"] = update_data["data_nascimento"].isoformat()
        
        parse_client.update_object("Cliente", cliente_id, update_data)
        
        # Get updated object
        result = parse_client.get_object("Cliente", cliente_id)
        return Cliente(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{cliente_id}")
async def delete_cliente(
    cliente_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        parse_client.delete_object("Cliente", cliente_id)
        return {"message": "Cliente deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))