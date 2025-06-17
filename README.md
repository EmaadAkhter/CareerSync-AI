# CareerSync AI 🎯

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)](https://flask.palletsprojects.com/)

**CareerSync AI** is an intelligent career matching system that uses advanced AI and natural language processing to synchronize your unique personality, skills, and aspirations with the perfect career path.

## ✨ Features

### 🧠 AI-Powered Matching
- **Advanced NLP**: Uses BAAI/bge-large-en-v1.5 sentence transformer model for semantic understanding
- **Semantic Similarity**: Employs cosine similarity for precise career-personality alignment
- **Intelligent Reasoning**: Generates detailed explanations for each career match

### 💬 Conversational Interface
- **Interactive Chat**: Engaging conversational flow that feels natural
- **Dynamic Follow-ups**: Asks deeper questions when responses need clarification
- **Adaptive Questioning**: 8 core areas with intelligent follow-up logic

### 🎨 Modern UI/UX
- **Gradient Design**: Beautiful, modern interface with smooth animations
- **Responsive Layout**: Works seamlessly across desktop and mobile devices
- **Real-time Results**: Instant career matching with visual feedback

### 📊 Comprehensive Analysis
- **Multi-dimensional Assessment**: Analyzes interests, skills, work style, values, and aspirations
- **Percentage Matching**: Quantified compatibility scores for each career suggestion
- **Detailed Insights**: Explains why each career aligns with your profile

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip package manager
- 4GB+ RAM (for AI model loading)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EmaadAkhter/CareerSync-AI.git
   cd CareerSync-AI
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install flask pandas sentence-transformers scikit-learn numpy werkzeug
   ```

4. **Prepare the dataset**
   - Download the career dataset from [Kaggle - Jobs and Skills Mapping](https://www.kaggle.com/datasets/emaadakhter/jobs-and-skills-mapping-for-career-analysis)
   - Save as `occ.csv` in the project root directory

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Access the application**
   - Open your browser and navigate to `http://localhost:5001`
   - Start your career discovery journey!

## 📁 Project Structure

```
CareerSync-AI/
├── app.py                 # Main Flask application
├── templates/
│   └── index.html        # Frontend chat interface
├── occ.csv              # Career dataset (download required)
├── requirements.txt     # Python dependencies
├── README.md           # Project documentation
├── LICENSE             # MIT License
└── .gitignore         # Git ignore rules
```

## 🔧 How It Works

### 1. **Conversational Assessment**
The system asks thoughtful questions across 8 key dimensions:
- 🎯 **Interests**: What energizes and engages you
- 💪 **Skills**: Your natural and developed abilities
- 🧩 **Problem Solving**: Your approach to challenges
- 🏢 **Work Style**: Preferred work environment and structure
- 💎 **Values**: What matters most in your career
- ✨ **Inspiration**: Careers that have caught your attention
- 🌍 **Environment**: Spaces where you thrive
- 🎬 **Impact**: The difference you want to make

### 2. **AI Processing**
- Combines all responses into a comprehensive personality profile
- Uses state-of-the-art sentence transformers to understand semantic meaning
- Compares your profile against hundreds of career descriptions
- Calculates similarity scores using advanced machine learning

### 3. **Intelligent Matching**
- Ranks careers by compatibility percentage
- Generates personalized explanations for each match
- Provides top 3 recommendations with detailed reasoning

## 🛠️ Technical Details

### Core Technologies
- **Backend**: Flask (Python web framework)
- **AI Model**: BAAI/bge-large-en-v1.5 (sentence transformer)
- **ML Libraries**: scikit-learn, numpy, pandas
- **Frontend**: Vanilla JavaScript with modern CSS

### Performance Features
- **Pre-computed Embeddings**: Career descriptions are embedded once at startup
- **Efficient Similarity**: Uses optimized cosine similarity calculations
- **Memory Management**: Smart handling of large AI models
- **Error Handling**: Comprehensive logging and graceful error recovery

### API Endpoints
- `GET /`: Main chat interface
- `POST /api/match-careers`: Career matching endpoint
- `GET /api/health`: System health check

## 📊 Dataset

This project uses the comprehensive career dataset available on Kaggle:
- **Source**: [Jobs and Skills Mapping for Career Analysis](https://www.kaggle.com/datasets/emaadakhter/jobs-and-skills-mapping-for-career-analysis)
- **Content**: Job titles, descriptions, required skills, and career information
- **Size**: Hundreds of diverse career options across multiple industries

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Setup
```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
python -m pytest

# Format code
black app.py
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Dataset**: Thanks to [Emaad Akhter](https://www.kaggle.com/datasets/emaadakhter/jobs-and-skills-mapping-for-career-analysis) for the comprehensive jobs and skills dataset
- **AI Model**: BAAI team for the excellent bge-large-en-v1.5 sentence transformer
- **Open Source**: The amazing Python and Flask communities

## 📞 Support

If you encounter any issues or have questions:
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the maintainer

## 🔮 Roadmap

- [ ] **Enhanced Personality Analysis**: More sophisticated psychological profiling
- [ ] **Industry Insights**: Detailed industry trends and growth projections
- [ ] **Learning Paths**: Recommended courses and skills development
- [ ] **Salary Information**: Compensation data for career recommendations
- [ ] **Mobile App**: Native mobile applications
- [ ] **Multi-language Support**: International career databases

---

**Made with ❤️ by Emaad Akhter**

*Helping people find their perfect career path through the power of AI*
