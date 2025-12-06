import csv
from typing import List, Dict
import os
from dotenv import load_dotenv
from embedder_utils import vectorize_and_store

load_dotenv()

CSV_FILE = "occ.csv"


def load_csv_data(filepath: str) -> List[Dict]:
    data = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
    return data


def main():
    data = load_csv_data(CSV_FILE)
    vectorize_and_store(data)
if __name__ == "__main__":
    main()