from pydantic import BaseModel
from typing import Optional

class ProcedimentoBase(BaseModel):
    nome: str
    descricao: str
    valor: float
    duracao_minutos: int

class ProcedimentoCreate(ProcedimentoBase):
    pass

class ProcedimentoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    valor: Optional[float] = None
    duracao_minutos: Optional[int] = None

class Procedimento(ProcedimentoBase):
    objectId: str
    createdAt: str
    updatedAt: str