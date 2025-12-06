# CareerSync AI 🎯

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

**CareerSync AI** is an intelligent career matching system that uses advanced AI, natural language processing, and vector database technology to synchronize your unique personality, skills, and aspirations with the perfect career path.

## ✨ Features

### 🧠 AI-Powered Matching
- **Advanced NLP**: Uses sentence-transformers/all-MiniLM-L6-v2 model for semantic understanding
- **Vector Database**: Pinecone for lightning-fast similarity search across thousands of careers
- **Semantic Search**: Employs cosine similarity for precise career-personality alignment
- **Real-time Processing**: Instant career matching with intelligent reasoning

### 💬 Interactive Multi-Step Form
- **Guided Experience**: 8 comprehensive sections covering all aspects of career discovery
- **Progress Tracking**: Visual progress bar showing completion percentage
- **Flexible Navigation**: Move forward and backward through sections
- **Rich Text Input**: Detailed textarea fields for thoughtful responses

### 🎨 Modern UI/UX
- **Gradient Design**: Beautiful purple gradient theme with smooth animations
- **Responsive Layout**: Works seamlessly across desktop, tablet, and mobile devices
- **Card-Based Results**: Elegant career match cards with hover effects
- **Real-time Feedback**: Loading states and error handling for better UX

### 📊 Comprehensive Analysis
- **Multi-dimensional Assessment**: Analyzes interests, skills, work style, values, and aspirations
- **Percentage Matching**: Quantified compatibility scores (0-100%) for each career
- **Detailed Insights**: Complete career information including skills, salary, education, and industry
- **Top Recommendations**: Get your top 5 most compatible career matches

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16+ and npm
- Pinecone account (free tier available)
- 4GB+ RAM (for AI model loading)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CareerSync-AI.git
   cd CareerSync-AI/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PINECONE_API_KEY=your_pinecone_api_key_here
   ```

5. **Prepare the dataset**
   - Download the career dataset from [Kaggle - Jobs and Skills Mapping](https://www.kaggle.com/datasets/emaadakhter/jobs-and-skills-mapping-for-career-analysis)
   - Save as `occ.csv` in the `backend` directory

6. **Initialize Pinecone index**
   ```bash
   python embedder_pinecone.py
   ```
   This will:
   - Load the career data from `occ.csv`
   - Generate embeddings using the AI model
   - Store vectors in Pinecone (takes 2-5 minutes)

7. **Run the backend server**
   ```bash
   python main.py
   ```
   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** (if needed)
   
   The API endpoint is configured in `App.jsx`. For local development, it should point to:
   ```javascript
   http://localhost:8000/api/match-careers
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Frontend will open at `http://localhost:5173` (Vite default port)

5. **Build for production** (optional)
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

## 📁 Project Structure

```
CareerSync-AI/
├── backend/
│   ├── embedder_pinecone.py   # Initial data ingestion script
│   ├── embedder_utils.py      # Vector embedding & search utilities
│   ├── main.py                # FastAPI application & endpoints
│   ├── occ.csv                # Career dataset (download required)
│   ├── render.yaml            # Render deployment configuration
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (create this)
├── frontend/
│   ├── public/
│   │   └── vite.svg          # Vite logo
│   ├── src/
│   │   ├── assets/           # Static assets
│   │   ├── App.css           # App component styles
│   │   ├── App.jsx           # Main React application
│   │   ├── index.css         # Global styles
│   │   └── main.jsx          # React entry point
│   ├── README.md             # Frontend documentation
│   ├── eslint.config.js      # ESLint configuration
│   ├── index.html            # HTML entry point
│   ├── package.json          # Node.js dependencies
│   ├── package-lock.json     # Dependency lock file
│   ├── postcss.config.js     # PostCSS configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── vite.config.js        # Vite configuration
├── .gitignore                # Git ignore rules
├── LICENSE                   # MIT License
└── README.md                 # Project documentation
```

## 🔧 How It Works

### 1. **Data Ingestion** (One-time Setup)
- Loads career data from CSV file
- Generates 384-dimensional embeddings for each career
- Stores vectors in Pinecone with metadata (job title, description, skills, etc.)
- Creates searchable index optimized for cosine similarity

### 2. **User Assessment**
The application guides users through 8 comprehensive sections:
- 🎯 **Interests**: What energizes and engages you
- 💪 **Skills**: Your natural and developed abilities  
- 🧩 **Problem Solving**: Your approach to challenges
- 🏢 **Work Style**: Preferred work environment and structure
- 💎 **Values**: What matters most in your career
- ✨ **Inspiration**: Careers and professionals that inspire you
- 🌍 **Environment**: Workspaces where you thrive best
- 🎬 **Impact**: The difference you want to make in the world

### 3. **AI Processing Pipeline**
1. **Query Construction**: Combines user responses into a semantic query
2. **Embedding Generation**: Converts query to 384-dimensional vector
3. **Vector Search**: Queries Pinecone for top 5 most similar careers
4. **Result Transformation**: Formats matches with percentages and details
5. **Response Delivery**: Returns structured JSON to frontend

### 4. **Intelligent Matching**
- Ranks careers by semantic similarity (0-100% match)
- Provides comprehensive career details
- Generates personalized reasoning for each match
- Displays skills, education, salary, and industry information

## 🛠️ Technical Details

### Core Technologies

**Backend Stack:**
- **FastAPI**: Modern, high-performance Python web framework
- **Pinecone**: Vector database for similarity search
- **Sentence Transformers**: State-of-the-art semantic embeddings
- **Pydantic**: Data validation and serialization

**Frontend Stack:**
- **React 18**: Component-based UI library
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS transformation and optimization
- **ESLint**: Code quality and consistency

### AI & ML Components
- **Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Embedding Dimension**: 384
- **Similarity Metric**: Cosine similarity
- **Vector Database**: Pinecone Serverless (AWS us-east-1)

### Performance Features
- **Serverless Architecture**: Pinecone handles scaling automatically
- **Batch Processing**: Efficient bulk vector uploads (100 vectors/batch)
- **Model Caching**: Sentence transformer loaded once at startup
- **Memory Management**: Automatic GPU/CPU memory cleanup
- **CORS Enabled**: Supports frontend deployed on Vercel

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information and version |
| `/health` | GET | System health check with Pinecone stats |
| `/api/match-careers` | POST | Career matching endpoint |

#### Match Careers Request Body
```json
{
  "interests": "string",
  "interests_fulltime": "string",
  "interests_appeal": "string",
  "skills": "string",
  "skills_natural": "string",
  "skills_energized": "string",
  "problem_solving": "string",
  "problem_method": "string",
  "problem_enjoy": "string",
  "work_style": "string",
  "work_routine": "string",
  "work_goals": "string",
  "values": "string",
  "values_why": "string",
  "values_choice": "string",
  "career_inspiration": "string",
  "inspiration_standout": "string",
  "inspiration_pursue": "string",
  "environment_preference": "string",
  "environment_why": "string",
  "focus_preference": "string",
  "impact_preference": "string",
  "impact_why": "string"
}
```

#### Match Careers Response
```json
{
  "matches": [
    {
      "job_title": "Software Engineer",
      "match_percentage": 89.5,
      "description": "Design and develop software applications...",
      "reasoning": "This career has a 89.5% semantic similarity...",
      "skills": "Python, JavaScript, Problem Solving",
      "industry": "Technology",
      "salary_range": "$80,000 - $150,000",
      "education": "Bachelor's in Computer Science",
      "work_environment": "Office/Remote"
    }
  ]
}
```

## 📊 Dataset

This project uses a comprehensive career dataset:
- **Source**: [Jobs and Skills Mapping for Career Analysis](https://www.kaggle.com/datasets/emaadakhter/jobs-and-skills-mapping-for-career-analysis)
- **Content**: Job titles, descriptions, required skills, salary ranges, education requirements
- **Coverage**: Hundreds of diverse careers across multiple industries
- **Fields**: job_title, description, required_skills, industry, salary_range, education, work_environment

## 🚢 Deployment

### Backend (Render - Recommended)

The project includes a `render.yaml` configuration file for easy deployment:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

3. **Set environment variables**
   - In Render dashboard, add:
   ```
   PINECONE_API_KEY=your_key_here
   ```

4. **Deploy**
   - Render will automatically build and deploy
   - Your API will be live at `https://your-service.onrender.com`

**Alternative: Railway/Heroku**
```bash
# Ensure requirements.txt includes all dependencies
pip freeze > requirements.txt

# Set environment variables in your platform:
PINECONE_API_KEY=your_key_here
```

### Frontend (Vercel - Recommended)

1. **Update API endpoint**
   
   In `frontend/src/App.jsx`, update the fetch URL:
   ```javascript
   const response = await fetch('https://your-backend.onrender.com/api/match-careers', {
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Navigate to frontend directory
   cd frontend
   
   # Deploy
   vercel
   ```

3. **Update CORS**
   
   In `backend/main.py`, add your Vercel domain:
   ```python
   allow_origins=[
       "https://your-app.vercel.app",
       "http://localhost:5173"
   ]
   ```

**Alternative: Netlify**
```bash
# Build the project
npm run build

# Deploy the dist/ folder to Netlify
# Or connect your GitHub repo to Netlify
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code (configured in `eslint.config.js`)
- Follow Tailwind CSS best practices
- Add comments for complex logic
- Test API endpoints before submitting
- Update documentation for new features
- Run linting before committing:
  ```bash
  # Frontend
  cd frontend
  npm run lint
  
  # Backend
  cd backend
  pylint *.py  # or your preferred linter
  ```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Dataset**: Thanks to the creator of the Jobs and Skills Mapping dataset
- **AI Model**: Hugging Face team for sentence-transformers
- **Pinecone**: For providing excellent vector database infrastructure
- **Open Source**: The amazing Python, React, and FastAPI communities

## 📞 Support

If you encounter any issues or have questions:
- **Issues**: [Open an issue on GitHub](https://github.com/yourusername/CareerSync-AI/issues)
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check FastAPI docs at `/docs` endpoint

## 🔮 Roadmap

- [ ] **Enhanced Personality Analysis**: ML-based personality profiling
- [ ] **Career Insights Dashboard**: Visual analytics and trends
- [ ] **Learning Paths**: AI-recommended courses and certifications
- [ ] **Salary Predictions**: ML-powered compensation forecasting
- [ ] **Job Market Trends**: Real-time industry growth data
- [ ] **Resume Analysis**: Upload resume for better matching
- [ ] **Interview Preparation**: AI-generated interview questions
- [ ] **Career Transition Paths**: Suggest career pivots with upskilling plans
- [ ] **Multi-language Support**: International career databases

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check if port 8000 is available
lsof -i :8000  # On Unix/Mac
netstat -ano | findstr :8000  # On Windows

# Try a different port
cd backend
uvicorn main:app --port 8001
```

**Frontend won't start:**
```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Try different port
npm run dev -- --port 5174
```

**Pinecone connection errors:**
- Verify your API key in `backend/.env`
- Check if index exists: Log in to Pinecone dashboard
- Ensure you're on the correct cloud/region
- Re-run `embedder_pinecone.py` if index is missing

**Frontend can't connect to backend:**
- Verify backend is running on `http://localhost:8000`
- Check CORS settings in `backend/main.py`
- Look for errors in browser console (F12)
- Ensure fetch URL in `App.jsx` is correct

**Model download issues:**
- First run downloads ~90MB model from Hugging Face
- Ensure stable internet connection
- Check disk space (need ~500MB free)
- Model will be cached in `~/.cache/huggingface/`

**Vite build errors:**
```bash
# Clear Vite cache
cd frontend
rm -rf node_modules/.vite
npm run dev
```

## 📈 Performance Metrics

- **Average Query Time**: <2 seconds
- **Embedding Generation**: ~500ms per query
- **Vector Search**: <100ms (Pinecone)
- **Concurrent Users**: Scales with Pinecone plan
- **Memory Usage**: ~2GB (with model loaded)

---

**Made with ❤️ for helping people discover their dream careers**

*Empowering career decisions through the power of AI and semantic search*
