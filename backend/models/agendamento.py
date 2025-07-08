from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class StatusAgendamento(str, Enum):
    agendado = "agendado"
    realizado = "realizado"
    cancelado = "cancelado"
    falta = "falta"

class AgendamentoBase(BaseModel):
    profissional_id: str
    cliente_id: str
    procedimento_id: str
    data_hora: datetime
    duracao_minutos: int
    observacoes: Optional[str] = None
    status: StatusAgendamento = StatusAgendamento.agendado

class AgendamentoCreate(AgendamentoBase):
    pass

class AgendamentoUpdate(BaseModel):
    data_hora: Optional[datetime] = None
    status: Optional[StatusAgendamento] = None
    observacoes: Optional[str] = None

class Agendamento(AgendamentoBase):
    objectId: str
    createdAt: str
    updatedAt: str