# 🚀 Cite&Sight AI

A full-stack web application designed to boost productivity through AI. It features an advanced abstractive document summarizer and an automated video-to-meeting-notes generator. 

The frontend is built with React and Vite, delivering a seamless user experience, while the backend leverages FastAPI, Hugging Face Transformers (`facebook/bart-large-cnn`), and Google's GenAI for heavy AI computation.

---

## ✨ Key Features

* 📝 **Abstractive Text Summarization**: Upload `.txt`, `.pdf`, or `.docx` files or paste text directly to generate concise, human-like summaries.
* 🎛️ **Customizable AI Output**: Granular control over the summary's compression ratio and beam search parameters for tailored results.
* 🎥 **Automated Meeting Notes**: Upload meeting video recordings. The backend automatically extracts audio, transcribes it, and uses Google Gemini AI to generate structured meeting minutes.
* 📚 **Citation Tool**: A built-in citation generator and style picker to easily manage references for your research or summarized documents.
* ⚡ **Fast & Modern UI**: Built with React 18, Vite, and modular CSS for a responsive, drag-and-drop enabled interface.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React 18 (via Vite)
* **Routing:** React Router v7
* **Document Parsing:** PDF.js (PDFs), Mammoth (DOCX)
* **Styling:** CSS Modules
* **HTTP Client:** Axios

### Backend
* **Framework:** FastAPI
* **AI Models:** PyTorch, Transformers (Hugging Face)
* **LLM API:** Google GenAI API
* **Video/Audio Processing:** MoviePy, Pydub, FFmpeg-python
* **Server:** Uvicorn

---

## 📂 Project Structure

```text
final-project/
├── backend/                  # FastAPI Backend
│   ├── routers/              # API Route handlers (summarizer, meetings)
│   ├── services/             # Core logic (video processing, gemini, transcription)
│   ├── main.py               # FastAPI application entry point
│   └── requirements.txt      # Python dependencies
└── frontend/                 # React Frontend
    ├── src/
    │   ├── components/       # UI Components (Summarizer, Meeting Notes, Citation Tool)
    │   ├── hooks/            # Custom React Hooks
    │   └── utils/            # Helper functions for export and parsing
    ├── package.json          # Node.js dependencies
    └── vite.config.js        # Vite configuration
```

---

## ⚙️ Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* [Python](https://www.python.org/) (3.10 or higher)
* [FFmpeg](https://ffmpeg.org/download.html) (Required for video/audio extraction. Must be added to system PATH)

### Quick Start (All-in-one commands)

**For macOS / Linux:**
```bash
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload & cd ../frontend && npm install && npm run dev
```

**For Windows (Command Prompt / PowerShell):**
```cmd
cd backend && python -m venv venv && call venv\Scripts\activate && pip install -r requirements.txt && start /B uvicorn main:app --reload && cd ../frontend && npm install && npm run dev
```

---

## 📡 Core API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Checks if the API and models are loaded properly. |
| `POST` | `/summarize/text` | Accepts raw text and returns an abstractive summary. |
| `POST` | `/summarize/file` | Accepts a `.pdf`, `.docx`, or `.txt` upload and returns a summary. |
| `POST` | `/upload-video` | Accepts a video file upload, processes it, and returns AI meeting notes. |

---

## 📝 License
This project is licensed under the MIT License.
