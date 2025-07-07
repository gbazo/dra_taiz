from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FichaAnamneseBase(BaseModel):
    cliente_id: str
    altura: float
    peso: float
    idade: int
    profissao: str
    historico_saude: dict  # {doencas: [], alergias: [], medicamentos: [], cirurgias: []}
    historico_estetico: str
    habitos_vida: str
    contraindicacoes: str
    consentimento_aceito: bool
    data_preenchimento: datetime

class FichaAnamneseCreate(FichaAnamneseBase):
    pass

class FichaAnamneseUpdate(BaseModel):
    altura: Optional[float] = None
    peso: Optional[float] = None
    profissao: Optional[str] = None
    historico_saude: Optional[dict] = None
    historico_estetico: Optional[str] = None
    habitos_vida: Optional[str] = None
    contraindicacoes: Optional[str] = None

class FichaAnamnese(FichaAnamneseBase):
    objectId: str
    createdAt: str
    updatedAt: str