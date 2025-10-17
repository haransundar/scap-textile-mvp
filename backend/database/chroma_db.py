"""
ChromaDB for vector storage and RAG
"""
import os
import logging

logger = logging.getLogger(__name__)

try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False
    logger.warning("⚠️ ChromaDB not available - RAG features will be limited")

from backend.utils.config import settings


class ChromaDBClient:
    def __init__(self):
        self.available = CHROMADB_AVAILABLE
        
        if not CHROMADB_AVAILABLE:
            logger.warning("⚠️ ChromaDB not installed - using fallback mode")
            self.client = None
            self.collection = None
            return
            
        try:
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
            logger.info("✅ ChromaDB initialized successfully")
        except Exception as e:
            logger.error(f"❌ ChromaDB initialization failed: {e}")
            self.available = False
            self.client = None
            self.collection = None
    
    def add_document(self, doc_id: str, text: str, metadata: dict):
        """Add document to vector store"""
        if not self.available or not self.collection:
            logger.warning("ChromaDB not available - document not added to vector store")
            return
            
        try:
            self.collection.add(
                ids=[doc_id],
                documents=[text],
                metadatas=[metadata]
            )
        except Exception as e:
            logger.error(f"Failed to add document: {e}")
    
    def search(self, query: str, n_results: int = 5):
        """Search for similar documents"""
        if not self.available or not self.collection:
            logger.warning("ChromaDB not available - returning empty results")
            return {'documents': [[]], 'distances': [[]], 'metadatas': [[]]}
            
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            return results
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return {'documents': [[]], 'distances': [[]], 'metadatas': [[]]}
    
    def delete_document(self, doc_id: str):
        """Delete document from vector store"""
        if not self.available or not self.collection:
            logger.warning("ChromaDB not available - document not deleted")
            return
            
        try:
            self.collection.delete(ids=[doc_id])
        except Exception as e:
            logger.error(f"Failed to delete document: {e}")


# Global instance
chroma_client = ChromaDBClient()
