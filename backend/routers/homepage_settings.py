from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List

from backend.models.homepage_settings import HomepageSettings, HomepageSettingsCreate, HomepageSettingsUpdate
from backend.utils.parse_client import parse_client
from backend.routers.auth import get_current_user

router = APIRouter()

# Endpoint para obter as configurações da homepage
@router.get("", response_model=HomepageSettings)
async def get_homepage_settings():
    try:
        settings = parse_client.query_objects("HomepageSettings")
        if not settings:
            # Retorna um objeto padrão se não houver configurações salvas
            # Isso deve ser substituído por um valor padrão real ou um erro
            raise HTTPException(status_code=404, detail="Configurações da homepage não encontradas.")
        return HomepageSettings(**settings[0])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Endpoint para atualizar as configurações da homepage (requer autenticação)
@router.put("", response_model=HomepageSettings)
async def update_homepage_settings(
    settings_update: HomepageSettingsUpdate,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Opcional: Adicionar verificação de permissão (ex: apenas admin)
        # if current_user["role"] != "admin":
        #     raise HTTPException(status_code=403, detail="Acesso negado")

        existing_settings = parse_client.query_objects("HomepageSettings")
        if existing_settings:
            # Atualiza as configurações existentes
            updated_settings = parse_client.update_object("HomepageSettings", existing_settings[0]["objectId"], settings_update.dict(exclude_unset=True))
            return HomepageSettings(**updated_settings)
        else:
            # Cria novas configurações se não existirem
            new_settings = parse_client.create_object("HomepageSettings", settings_update.dict())
            return HomepageSettings(**new_settings)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upload_image")
async def upload_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        # Opcional: Adicionar verificação de permissão (ex: apenas admin)
        # if current_user["role"] != "admin":
        #     raise HTTPException(status_code=403, detail="Acesso negado")

        file_content = await file.read()
        file_name = file.filename
        content_type = file.content_type

        # Salva o arquivo usando o parse_client
        result = parse_client.upload_file(file_name, content_type, file_content)
        
        return {"url": result["url"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
