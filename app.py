from flask import Flask, request, jsonify, render_template
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import os
from werkzeug.exceptions import RequestEntityTooLarge
import logging


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Initialize the model and data
model = None
career_embeddings = None
df = None


def load_model_and_data():
    """Load the AI model and career data"""
    global model, career_embeddings, df

    try:
        logger.info("Loading AI model...")
        model = SentenceTransformer("BAAI/bge-large-en-v1.5")

        logger.info("Loading career data...")
        # Check if CSV file exists
        if not os.path.exists("occ.csv"):
            logger.error("occ.csv file not found!")
            return False

        df = pd.read_csv("occ.csv")
        logger.info(f"Loaded {len(df)} career records")

        # Create full text descriptions
        df["full_text"] = (
                df["job_title"].fillna('') + ". " +
                df["Short_description"].fillna('') + " " +
                df["Skills_required"].fillna('')
        )

        # Pre-compute embeddings for all careers
        logger.info("Computing career embeddings...")
        texts = ["Represent this sentence for retrieval: " + t for t in df["full_text"].tolist()]
        career_embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=True)

        logger.info("Model and data loaded successfully!")
        return True

    except Exception as e:
        logger.error(f"Error loading model and data: {str(e)}")
        return False


def generate_reasoning(user_embedding, job_title, job_description, skills, model):
    """Generate reasoning for why a job matches user preferences"""
    try:
        # Combine skills and description into separate phrases
        skill_list = skills.split() if skills else []
        components = [job_description] + skill_list

        # Filter out empty components
        components = [c for c in components if c.strip()]

        if not components:
            return f"The role of a {job_title} could be a good match based on your overall preferences.", [], []

        # Embed all job components
        component_embeddings = model.encode(components, normalize_embeddings=True)

        # Reshape user_embedding if needed
        if user_embedding.ndim == 1:
            user_embedding = user_embedding.reshape(1, -1)

        # Compute similarity
        similarities = cosine_similarity(user_embedding, component_embeddings)[0]

        # Sort by similarity
        top_indices = np.argsort(similarities)[::-1][:3]  # top 3
        top_reasons = [components[i] for i in top_indices]

        # Generate explanation
        if len(top_reasons) == 1:
            explanation = f"The role of a {job_title} aligns with your interests because it involves {top_reasons[0]}."
        elif len(top_reasons) == 2:
            explanation = f"The role of a {job_title} aligns with your interests because it involves {top_reasons[0]} and {top_reasons[1]}."
        else:
            explanation = (
                    f"The role of a {job_title} aligns with your interests because it involves "
                    + ", ".join(top_reasons[:-1])
                    + f", and {top_reasons[-1]}."
            )

        return explanation, similarities[top_indices], top_reasons

    except Exception as e:
        logger.error(f"Error generating reasoning: {str(e)}")
        return f"The role of a {job_title} matches your profile based on your stated preferences.", [], []


@app.route('/')
def index():
    """Serve the main HTML page"""
    try:
        from flask import render_template
        return render_template('index.html')
    except Exception as e:
        logger.error(f"Error serving index.html: {str(e)}")
        return f"Error loading page: {str(e)}", 500


@app.route('/api/match-careers', methods=['POST'])
def match_careers():
    """API endpoint to match careers based on user input"""
    try:
        if model is None or career_embeddings is None or df is None:
            logger.error("AI model not loaded")
            return jsonify({'error': 'AI model not loaded. Please try again later.'}), 500

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        logger.info(f"Received data keys: {list(data.keys())}")

        # Combine all user responses into a single text
        user_responses = []
        for key, value in data.items():
            if value and str(value).strip():
                user_responses.append(str(value).strip())

        if not user_responses:
            return jsonify({'error': 'Please provide some information about your preferences'}), 400

        user_text = " ".join(user_responses)
        logger.info(f"Processing user preferences (length: {len(user_text)})")

        # Create user embedding
        user_embedding_text = "Represent this sentence for retrieval: " + user_text
        user_embedding = model.encode(user_embedding_text, normalize_embeddings=True)

        # Compute similarities with all careers
        similarities = cosine_similarity([user_embedding], career_embeddings)[0]
        top_indices = np.argsort(similarities)[::-1][:5]  # Top 5 matches

        # Prepare results
        matches = []
        for idx in top_indices:
            job_data = df.iloc[idx]

            # Generate reasoning for this match
            reasoning, _, _ = generate_reasoning(
                user_embedding=user_embedding,
                job_title=job_data["job_title"],
                job_description=job_data["Short_description"],
                skills=job_data["Skills_required"],
                model=model
            )

            match_info = {
                'job_title': str(job_data["job_title"]),
                'description': str(job_data["Short_description"]),
                'skills': str(job_data["Skills_required"]),
                'similarity_score': float(similarities[idx]),
                'match_percentage': float(similarities[idx] * 100),
                'reasoning': reasoning
            }
            matches.append(match_info)

        logger.info(f"Found {len(matches)} career matches")
        return jsonify({'matches': matches})

    except RequestEntityTooLarge:
        return jsonify({'error': 'Request too large. Please reduce the amount of text.'}), 413
    except Exception as e:
        logger.error(f"Error in match_careers: {str(e)}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    status = {
        'status': 'ok',
        'model_loaded': model is not None,
        'data_loaded': df is not None,
        'embeddings_ready': career_embeddings is not None,
        'career_count': len(df) if df is not None else 0
    }
    return jsonify(status)


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    logger.info("Starting Career Matcher Web Application...")

    # Check if required files exist
    if not os.path.exists("templates/index.html"):
        logger.error("templates/index.html file not found!")
        exit(1)

    if not os.path.exists("occ.csv"):
        logger.error("occ.csv file not found in current directory!")
        exit(1)

    # Load model and data on startup
    if load_model_and_data():
        logger.info("Server ready!")
        logger.info("Visit http://localhost:5001 to access the application")
        app.run(debug=False, host='0.0.0.0', port=5001)
    else:
        logger.error("Failed to load model and data. Server not started.")