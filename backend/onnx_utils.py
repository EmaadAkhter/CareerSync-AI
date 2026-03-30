import os
import numpy as np
import onnxruntime as ort
from transformers import AutoTokenizer
from huggingface_hub import hf_hub_download

class ONNXMiniLMEmbedder:
    def __init__(self, model_id="sentence-transformers/all-MiniLM-L6-v2"):
        self.model_id = model_id
        self.tokenizer = AutoTokenizer.from_pretrained(model_id)
        
        # Download the ONNX model (canonical filename)
        model_path = hf_hub_download(
            repo_id=model_id, 
            filename="onnx/model.onnx"
        )
        
        # Initialize ONNX runtime session with CPU execution provider
        self.session = ort.InferenceSession(
            model_path, 
            providers=["CPUExecutionProvider"]
        )

    def _mean_pooling(self, model_output, attention_mask):
        token_embeddings = model_output[0]
        input_mask_expanded = np.expand_dims(attention_mask, axis=-1).astype(float)
        return np.sum(token_embeddings * input_mask_expanded, axis=1) / np.maximum(np.sum(input_mask_expanded, axis=1), 1e-9)

    def encode(self, sentences, batch_size=32):
        if isinstance(sentences, str):
            sentences = [sentences]
            
        all_embeddings = []
        for i in range(0, len(sentences), batch_size):
            batch = sentences[i : i + batch_size]
            encoded_input = self.tokenizer(
                batch, 
                padding=True, 
                truncation=True, 
                return_tensors="np"
            )
            
            # Prepare inputs for ONNX
            onnx_inputs = {
                "input_ids": encoded_input["input_ids"].astype(np.int64),
                "attention_mask": encoded_input["attention_mask"].astype(np.int64),
                "token_type_ids": encoded_input["token_type_ids"].astype(np.int64),
            }
            
            # Run inference
            model_output = self.session.run(None, onnx_inputs)
            
            # Perform mean pooling
            embeddings = self._mean_pooling(model_output, onnx_inputs["attention_mask"])
            
            # L2 Normalization (optional but recommended for cosine similarity)
            norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
            embeddings = embeddings / np.maximum(norms, 1e-12)
            
            all_embeddings.extend(embeddings)
            
        return np.array(all_embeddings)
