"""
ChromaDB for vector storage and RAG
"""
import chromadb
from chromadb.config import Settings as ChromaSettings
from utils.config import settings
import os


class ChromaDBClient:
    def __init__(self):
        # Ensure persistence directory exists
        persist_dir = os.path.abspath(settings.CHROMA_PERSIST_DIR)
        os.makedirs(persist_dir, exist_ok=True)
        
        self.client = chromadb.PersistentClient(
            path=persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        
        # Create or get collection for supplier documents
        self.collection = self.client.get_or_create_collection(
            name="supplier_documents",
            metadata={"description": "Supplier certificates and compliance documents"}
        )
    
    def add_document(self, doc_id: str, text: str, metadata: dict):
        """Add document to vector store"""
        self.collection.add(
            ids=[doc_id],
            documents=[text],
            metadatas=[metadata]
        )
    
    def search(self, query: str, n_results: int = 5):
        """Search for similar documents"""
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        return results
    
    def delete_document(self, doc_id: str):
        """Delete document from vector store"""
        self.collection.delete(ids=[doc_id])


# Global instance
chroma_client = ChromaDBClient()
