from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from summarizer import AbstractiveSummarizer

# Import the new routers
from routers import summarizer_api, meetings_api

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up: Loading AI Models...")
    # Load the model directly into the app state
    app.state.summarizer = AbstractiveSummarizer()
    yield
    print("Shutting down: Clearing AI Models...")
    del app.state.summarizer

app = FastAPI(title="AI Tools API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "message": "API is running."}

# Register the separated routers to the main app
app.include_router(summarizer_api.router)
app.include_router(meetings_api.router)