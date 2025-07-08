# app/backend/routers/agendamentos.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, date, timedelta

from backend.models.agendamento import Agendamento, AgendamentoCreate, AgendamentoUpdate, StatusAgendamento
from backend.utils.parse_client import parse_client
from backend.routers.auth import get_current_user

router = APIRouter()

def check_conflito_horario(data_hora: datetime, duracao_minutos: int, agendamento_id: str = None):
    """Verifica se há conflito de horário na sala"""
    inicio = data_hora
    fim = datetime.fromisoformat(data_hora.isoformat()) + timedelta(minutes=duracao_minutos)
    
    # Query para buscar agendamentos que conflitam
    where = {
        "status": {"$ne": "cancelado"},
        "data_hora": {
            "$gte": {"__type": "Date", "iso": inicio.isoformat()},
            "$lt": {"__type": "Date", "iso": fim.isoformat()}
        }
    }
    
    conflitos = parse_client.query_objects("Agendamento", where=where)
    
    # Remove o próprio agendamento se estiver editando
    if agendamento_id:
        conflitos = [a for a in conflitos if a["objectId"] != agendamento_id]
    
    return len(conflitos) > 0

@router.post("", response_model=Agendamento)
async def create_agendamento(
    agendamento: AgendamentoCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Verificar conflito de horário
        if check_conflito_horario(agendamento.data_hora, agendamento.duracao_minutos):
            raise HTTPException(status_code=400, detail="Horário já ocupado")
        
        data = agendamento.dict()
        data["data_hora"] = {"__type": "Date", "iso": data["data_hora"].isoformat()}
        data["criado_por"] = current_user["objectId"]
        
        result = parse_client.create_object("Agendamento", data)
        if 'data_hora' in result and isinstance(result['data_hora'], dict):
            result['data_hora'] = result['data_hora']['iso']
        return Agendamento(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[Agendamento])
async def list_agendamentos(
    data_inicio: date = None,
    data_fim: date = None,
    profissional_id: str = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        where = {}
        
        if data_inicio and data_fim:
            where["data_hora"] = {
                "$gte": {"__type": "Date", "iso": f"{data_inicio}T00:00:00.000Z"},
                "$lte": {"__type": "Date", "iso": f"{data_fim}T23:59:59.999Z"}
            }
        
        if profissional_id:
            where["profissional_id"] = profissional_id
        
        results = parse_client.query_objects("Agendamento", where=where, order="data_hora")
        
        # Corrigir o formato da data antes de retornar
        agendamentos_corrigidos = []
        for ag in results:
            if 'data_hora' in ag and isinstance(ag['data_hora'], dict):
                ag['data_hora'] = ag['data_hora']['iso']
            agendamentos_corrigidos.append(Agendamento(**ag))
            
        return agendamentos_corrigidos
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{agendamento_id}", response_model=Agendamento)
async def get_agendamento(
    agendamento_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = parse_client.get_object("Agendamento", agendamento_id)
        if 'data_hora' in result and isinstance(result['data_hora'], dict):
            result['data_hora'] = result['data_hora']['iso']
        return Agendamento(**result)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Agendamento not found")

@router.put("/{agendamento_id}", response_model=Agendamento)
async def update_agendamento(
    agendamento_id: str,
    agendamento: AgendamentoUpdate,
    current_user: dict = Depends(get_current_user)
):
    try:
        update_data = {k: v for k, v in agendamento.dict().items() if v is not None}
        
        # Se está mudando data/hora, verificar conflito
        if "data_hora" in update_data:
            # Buscar agendamento atual para pegar duração
            current = parse_client.get_object("Agendamento", agendamento_id)
            if check_conflito_horario(update_data["data_hora"], current["duracao_minutos"], agendamento_id):
                raise HTTPException(status_code=400, detail="Horário já ocupado")
            
            update_data["data_hora"] = {"__type": "Date", "iso": update_data["data_hora"].isoformat()}
        
        parse_client.update_object("Agendamento", agendamento_id, update_data)
        
        result = parse_client.get_object("Agendamento", agendamento_id)
        if 'data_hora' in result and isinstance(result['data_hora'], dict):
            result['data_hora'] = result['data_hora']['iso']
        return Agendamento(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{agendamento_id}")
async def delete_agendamento(
    agendamento_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Soft delete - apenas muda status para cancelado
        parse_client.update_object("Agendamento", agendamento_id, {"status": "cancelado"})
        return {"message": "Agendamento cancelado"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{agendamento_id}/status", response_model=Agendamento)
async def update_agendamento_status(
    agendamento_id: str,
    status: StatusAgendamento,
    current_user: dict = Depends(get_current_user)
):
    try:
        update_data = {"status": status.value}
        parse_client.update_object("Agendamento", agendamento_id, update_data)
        
        result = parse_client.get_object("Agendamento", agendamento_id)
        if 'data_hora' in result and isinstance(result['data_hora'], dict):
            result['data_hora'] = result['data_hora']['iso']
            
        return Agendamento(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/migrate_status")
async def migrate_agendamento_status(current_user: dict = Depends(get_current_user)):
    try:
        # Apenas para administradores ou usuários autorizados
        # if current_user["role"] != "admin":
        #     raise HTTPException(status_code=403, detail="Acesso negado")

        where = {"status": "confirmado"}
        agendamentos_to_migrate = parse_client.query_objects("Agendamento", where=where)
        
        count = 0
        for ag in agendamentos_to_migrate:
            parse_client.update_object("Agendamento", ag["objectId"], {"status": "agendado"})
            count += 1
        
        return {"message": f"{count} agendamentos migrados de 'confirmado' para 'agendado'"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
