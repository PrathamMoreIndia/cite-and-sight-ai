from moviepy.editor import VideoFileClip
from pydub import AudioSegment
import math

from services.transcription import transcribe_audio
from services.gemini_service import generate_summary

def process_video(video_path):

    audio_path = "uploads/audio.mp3"

    video = VideoFileClip(video_path)

    video.audio.write_audiofile(
        audio_path,
        fps=16000,
        nbytes=2,
        ffmpeg_params=["-ac", "1"],
        logger=None
    )

    audio = AudioSegment.from_mp3(audio_path)

    chunk_length_ms = 60 * 1000

    total_chunks = math.ceil(
        len(audio) / chunk_length_ms
    )

    transcript = ""

    for i in range(total_chunks):

        start = i * chunk_length_ms
        end = start + chunk_length_ms

        chunk = audio[start:end]

        chunk_path = f"chunks/chunk_{i}.mp3"

        chunk.export(
            chunk_path,
            format="mp3"
        )

        text = transcribe_audio(chunk_path)

        transcript += text + "\\n"

    summary = generate_summary(transcript)

    return {
        "transcript": transcript,
        "summary": summary
    }