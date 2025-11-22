# EduQuill RAG - AI-Powered Learning Companion

EduQuill is an open-source RAG (Retrieval Augmented Generation) application designed to help students and teachers by providing an AI-powered learning companion. The system allows users to upload educational documents (PDFs) and ask questions about the content, with the AI providing contextual answers based solely on the uploaded materials.

## 🚀 Features

- **Document Upload & Indexing**: Upload PDF documents that are automatically processed and indexed into a vector database
- **Contextual Q&A**: Ask questions about uploaded documents and receive answers based on retrieved context
- **Multi-Provider LLM Support**: Choose between local (Ollama) or cloud (Groq) LLM providers
- **Multiple Model Options**: Support for various language models optimized for different use cases
- **Conversation Memory**: Maintains session-based conversation history for contextual follow-ups
- **Source Citation**: Answers include citations showing which document chunks were used
- **Multilingual Support**: Automatically detects and responds in the user's language
- **Modern UI**: Clean, dark-themed React frontend with real-time feedback

## 🏗️ Architecture

The project consists of two main components:

### Backend (FastAPI)
- **API Layer**: RESTful endpoints for document upload and chat queries
- **RAG Pipeline**: Document ingestion, chunking, embedding, and retrieval
- **Vector Store**: ChromaDB for semantic search
- **LLM Integration**: LangChain-based integration with Ollama and Groq
- **Session Memory**: Conversation history management

### Frontend (React + Vite)
- **Document Upload Interface**: File selection and upload
- **Chat Interface**: Question input with model/provider configuration
- **Answer Display**: Markdown-rendered responses with source citations
- **Model Selection**: Dynamic model lists based on selected provider

## 📋 Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 16+** (for frontend)
- **Ollama** (optional, for local models) - [Install Ollama](https://ollama.ai)
- **Groq API Key** (optional, for cloud models) - [Get API Key](https://console.groq.com)

## 🛠️ Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. (Optional) Set environment variables:
```bash
# For Groq API (if not providing in UI)
export GROQ_API_KEY="your-groq-api-key-here"
```

5. Run the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend/eduquill-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📖 Usage

1. **Upload Documents**: 
   - Click "Choose File" and select a PDF document
   - Click "Upload & Index" to process the document

2. **Configure Model**:
   - Select your preferred provider (Ollama for local, Groq for cloud)
   - Choose a model from the dropdown
   - If using Groq, optionally enter your API key (or use environment variable)

3. **Ask Questions**:
   - Type your question in the text area
   - Click "Ask EduQuill" to get an answer
   - View the answer with source citations in the right panel

## 🤖 Supported Models

The application supports multiple language models through two providers. The model selection is dynamically configured in the frontend (`App.jsx`):

### Ollama Models (Local)
These models run locally using Ollama. Make sure you have the models downloaded:
```bash
ollama pull qwen2.5:14b-instruct
ollama pull llama3
# etc.
```

Available models:
- **Qwen 2.5 14B Instruct** (default) - `qwen2.5:14b-instruct`
- **Llama 3** - `llama3`
- **Llama 3.2** - `llama3.2`
- **Mistral** - `mistral`
- **Mixtral** - `mixtral`
- **Qwen 2.5** - `qwen2.5`
- **Phi-3** - `phi3`

### Groq Models (Cloud API)
These models are accessed via Groq's API. Requires an API key from [console.groq.com](https://console.groq.com).

#### Premium / Gold Models
- **GPT OSS 120B ⭐ (Best Quality)** - `openai/gpt-oss-120b`
- **Llama 3.3 70B Versatile** - `llama-3.3-70b-versatile`
- **Qwen 3 32B (Multilingual)** - `qwen-3-32b`

#### Standard Models
- **Llama 3.1 8B Instant** - `llama-3.1-8b-instant`
- **GPT OSS 20B (Fast & Efficient)** - `openai/gpt-oss-20b`
- **Mixtral 8x7B** - `mixtral-8x7b-32768`
- **Gemma 7B IT** - `gemma-7b-it`

#### Specialized Models
- **Llama 4 Scout (Tool Use)** - `llama-4-scout`
- **Kimi K2 (Long-form)** - `kimi-k2`
- **Llama 4 Maverick (Vision)** - `llama-4-maverick`

### Model Selection in Code

The model configuration is defined in `frontend/eduquill-frontend/src/App.jsx`:

```javascript
const getAvailableModels = () => {
  if (providerType === "ollama") {
    return [
      { value: "qwen2.5:14b-instruct", label: "Qwen 2.5 14B Instruct" },
      { value: "llama3", label: "Llama 3" },
      // ... more Ollama models
    ];
  } else {
    return [
      // Premium models
      { value: "openai/gpt-oss-120b", label: "GPT OSS 120B ⭐ (Best Quality)" },
      // ... more Groq models
    ];
  }
};
```

To add or modify models, edit the `getAvailableModels()` function in `App.jsx` (lines 66-97).

## 🔌 API Endpoints

### Health Check
- `GET /health` - Check API status

### Documents
- `POST /api/v1/documents/upload` - Upload and index a PDF document
  - Body: `multipart/form-data` with `file` field
  - Returns: `{doc_id, filename}`

### Chat
- `POST /api/v1/chat/query` - Query the RAG system
  - Body:
    ```json
    {
      "query": "Your question here",
      "session_id": "optional-session-id",
      "k": 4,
      "model": "qwen2.5:14b-instruct",
      "provider_type": "ollama",
      "api_key": "optional-groq-api-key"
    }
    ```
  - Returns:
    ```json
    {
      "answer": "AI-generated answer",
      "sources": [
        {
          "doc_id": "uuid",
          "title": "document.pdf",
          "chunk_index": 0,
          "text": "retrieved chunk text",
          "score": 0.85
        }
      ]
    }
    ```

## 📁 Project Structure

```
eduquill-rag/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat.py          # Chat query endpoint
│   │   │   ├── documents.py      # Document upload endpoint
│   │   │   └── health.py         # Health check endpoint
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic models
│   │   ├── rag/
│   │   │   ├── embeddings.py     # Embedding generation
│   │   │   ├── llm_client.py     # LLM integration (Ollama/Groq)
│   │   │   ├── pipeline.py       # RAG pipeline orchestration
│   │   │   ├── session_memory.py # Conversation memory
│   │   │   └── vector_store.py   # ChromaDB vector store
│   │   └── main.py               # FastAPI app
│   ├── data/
│   │   ├── chroma/               # ChromaDB data
│   │   └── uploads/              # Uploaded PDFs
│   └── requirements.txt
├── frontend/
│   └── eduquill-frontend/
│       ├── src/
│       │   ├── App.jsx           # Main React component
│       │   ├── App.css
│       │   ├── index.css
│       │   └── main.jsx
│       ├── package.json
│       └── vite.config.js
└── README.md
```

## 🔒 Security & Privacy

- **Local Processing**: When using Ollama, all processing happens locally
- **Context Restriction**: The AI is configured to only answer questions about uploaded documents
- **No Data Sharing**: Uploaded documents are stored locally and not shared with third parties (except when using Groq API)

## 🎯 Key Features Explained

### RAG Pipeline
1. **Document Ingestion**: PDFs are parsed and split into chunks
2. **Embedding**: Chunks are converted to vector embeddings using sentence-transformers
3. **Storage**: Embeddings are stored in ChromaDB with metadata
4. **Retrieval**: User queries are embedded and used to find similar chunks
5. **Generation**: Retrieved chunks are sent to the LLM as context for answer generation

### Session Memory
- Maintains conversation history per session ID
- Enables contextual follow-up questions
- Uses LangChain's memory system for state management

### Strict Context Mode
The system is configured to **only answer questions about uploaded documents**. Questions outside the document scope are refused to ensure accuracy and prevent hallucinations.

## 🐛 Troubleshooting

### Backend Issues
- **Port already in use**: Change the port in `uvicorn` command or kill the process using port 8000
- **ChromaDB errors**: Delete `backend/data/chroma/` and restart
- **Model not found (Ollama)**: Ensure the model is downloaded: `ollama pull <model-name>`

### Frontend Issues
- **CORS errors**: Ensure backend is running and CORS is configured correctly
- **API connection failed**: Check that backend is running on `http://localhost:8000`

### Model Issues
- **Groq API errors**: Verify your API key is correct and has sufficient credits
- **Ollama connection failed**: Ensure Ollama is running: `ollama serve`





