from pydantic import BaseModel
from typing import Optional

class ProcedimentoBase(BaseModel):
    nome: str
    duracao_minutos: int
    descricao: Optional[str] = None
    valor: Optional[float] = None

class ProcedimentoCreate(ProcedimentoBase):
    pass

class ProcedimentoUpdate(ProcedimentoBase):
    nome: Optional[str] = None
    duracao_minutos: Optional[int] = None
    valor: Optional[float] = None

class Procedimento(ProcedimentoBase):
    objectId: str
    createdAt: str
    updatedAt: str

    class Config:
        orm_mode = True