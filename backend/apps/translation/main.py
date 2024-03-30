import os
import logging
from fastapi import (
    FastAPI,
    Request,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form,
)
import requests
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel

from constants import ERROR_MESSAGES
from utils.utils import (
    decode_token,
    get_current_user,
    get_verified_user,
    get_admin_user,
)
from utils.misc import calculate_sha256

from pydantic import BaseModel
from typing import Optional

from config import SRC_LOG_LEVELS, DEEPLX_BASE_URL

log = logging.getLogger(__name__)
log.setLevel(SRC_LOG_LEVELS["AUDIO"])

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.ENGINE = ""
app.state.DEEPLX_BASE_URL = DEEPLX_BASE_URL
app.state.ENABLED = False

class TranslateForm(BaseModel):
    text: str
    source_lang: str
    target_lang: str

@app.post("/translate")
def translate(
    form_data: TranslateForm,
    user=Depends(get_current_user),
):
    translation_data = {
        "text": form_data.text.strip(),
        "source_lang": form_data.source_lang,
        "target_lang": form_data.target_lang
    }

    print(translation_data)

    try:
        response = requests.post(url=f"{app.state.DEEPLX_BASE_URL}/translate", json=translation_data)

        if response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Translation server error")

        translation_response = response.json()

        print(translation_response)

        return {"translation": translation_response["data"], "alternatives": translation_response["alternatives"]}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

class EngineUrlUpdateForm(BaseModel):
    DEEPLX_BASE_URL: Optional[str] = None

@app.get("/url")
async def get_engine_url(user=Depends(get_admin_user)):
    return {
        "DEEPLX_BASE_URL": app.state.DEEPLX_BASE_URL
    }

@app.post("/url/update")
async def update_engine_url(
    form_data: EngineUrlUpdateForm, user=Depends(get_admin_user)
):
    print(form_data)

    if form_data.DEEPLX_BASE_URL == None:
        app.state.DEEPLX_BASE_URL = DEEPLX_BASE_URL
    else:
        url = form_data.DEEPLX_BASE_URL.strip("/")
        try:
            r = requests.head(url)
            app.state.DEEPLX_BASE_URL = url
        except Exception as e:
            raise HTTPException(status_code=400, detail=ERROR_MESSAGES.DEFAULT(e))

    return {
        "DEEPLX_BASE_URL": app.state.DEEPLX_BASE_URL,
        "status": True,
    }

class EnabledUpdateForm(BaseModel):
    engine: str
    enabled: bool

@app.get("/config")
async def get_config(request: Request, user=Depends(get_admin_user)):
    return {"engine": app.state.ENGINE, "enabled": app.state.ENABLED}

@app.post("/config/update")
async def update_config(form_data: EnabledUpdateForm, user=Depends(get_admin_user)):
    app.state.ENGINE = form_data.engine
    app.state.ENABLED = form_data.enabled
    return {"engine": app.state.ENGINE, "enabled": app.state.ENABLED}