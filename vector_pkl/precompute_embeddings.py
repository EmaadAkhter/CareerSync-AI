import pandas as pd
from sentence_transformers import SentenceTransformer
import numpy as np
import pickle
import os
import sys
from tqdm import tqdm

# High-quality model (larger, slower, better quality)
MODEL_NAME = "all-MiniLM-L6-v2"
EMBEDDINGS_FILE = "career_embeddings.pkl"
CSV_FILE = "occ.csv"


def precompute_embeddings():
    """Load careers, compute embeddings, and save them"""


    model = SentenceTransformer(MODEL_NAME)

    if not os.path.exists(CSV_FILE):
        print(f"ERROR: {CSV_FILE} not found in current directory!")
        sys.exit(1)

    df = pd.read_csv(CSV_FILE)
    print(f"Loaded {len(df)} career records")

    # Create full text descriptions
    df["full_text"] = (
            df["job_title"].fillna('') + ". " +
            df["Short_description"].fillna('') + " " +
            df["Skills_required"].fillna('')
    )

    texts = df["full_text"].tolist()

    # Prepare texts with instruction prefix
    texts_with_instruction = [
        "Represent this sentence for retrieval: " + t
        for t in texts
    ]

    # Compute embeddings with progress bar
    embeddings = model.encode(
        texts_with_instruction,
        normalize_embeddings=True,
        show_progress_bar=True,
        batch_size=32  # Batch processing for efficiency
    )


    print(f"\nEmbeddings shape: {embeddings.shape}")
    print(f"Embedding dtype: {embeddings.dtype}")

    # Save embeddings
    with open(EMBEDDINGS_FILE, "wb") as f:
        pickle.dump(embeddings, f)

    file_size_mb = os.path.getsize(EMBEDDINGS_FILE) / (1024 * 1024)


if __name__ == "__main__":
    try:
        precompute_embeddings()
    except Exception as e:
        sys.exit(1)