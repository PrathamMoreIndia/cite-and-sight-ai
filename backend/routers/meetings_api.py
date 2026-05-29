import os
import shutil
from fastapi import APIRouter, UploadFile, File
from services.video_processor import process_video

router = APIRouter()

@router.post("/upload-video")
async def upload_video(file: UploadFile = File(...)):

    os.makedirs("uploads", exist_ok=True)
    video_path = f"uploads/{file.filename}"

    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = process_video(video_path)

    return result