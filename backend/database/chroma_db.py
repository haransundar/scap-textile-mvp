"""
ChromaDB for vector storage and RAG with Google embeddings
"""
import os
import logging

logger = logging.getLogger(__name__)

try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    import google.generativeai as genai
    CHROMADB_AVAILABLE = True
    GOOGLE_AI_AVAILABLE = True
except ImportError as e:
    CHROMADB_AVAILABLE = False
    GOOGLE_AI_AVAILABLE = False
    logger.warning(f"⚠️ ChromaDB or Google AI not available: {e}")

from utils.config import settings


class GoogleEmbeddingFunction:
    """Custom embedding function using Google's text-embedding-004"""
    def __init__(self):
        try:
            genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
            self.available = True
            logger.info("✅ Google text-embedding-004 configured")
        except Exception as e:
            logger.warning(f"⚠️ Google embeddings not available: {e}")
            self.available = False
    
    def __call__(self, input: list[str]) -> list[list[float]]:
        """Generate embeddings for input texts"""
        if not self.available:
            # Fallback to default ChromaDB embeddings
            return None
        
        try:
            embeddings = []
            for text in input:
                result = genai.embed_content(
                    model="models/text-embedding-004",
                    content=text,
                    task_type="retrieval_document"
                )
                embeddings.append(result['embedding'])
            return embeddings
        except Exception as e:
            logger.warning(f"⚠️ Google embedding failed: {e}, using default")
            return None


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
            
            # Create embedding function
            embedding_function = None
            if GOOGLE_AI_AVAILABLE:
                try:
                    embedding_function = GoogleEmbeddingFunction()
                    if not embedding_function.available:
                        embedding_function = None
                except Exception as e:
                    logger.warning(f"⚠️ Failed to create Google embedding function: {e}")
                    embedding_function = None
            
            # Create or get collection for supplier documents
            self.collection = self.client.get_or_create_collection(
                name="supplier_documents",
                metadata={"description": "Supplier certificates and compliance documents"},
                embedding_function=embedding_function
            )
            
            if embedding_function:
                logger.info("✅ ChromaDB initialized with Google text-embedding-004")
            else:
                logger.info("✅ ChromaDB initialized with default embeddings")
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
