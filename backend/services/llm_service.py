"""
LLM service for chatbot using Qwen 2.5 32B via Groq
"""
from groq import Groq
from utils.config import settings
import logging
from typing import List, Dict, AsyncGenerator
from database.chroma_db import chroma_client

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self):
        try:
            self.client = Groq(api_key=settings.GROQ_API_KEY)
            self.model = "qwen2-72b-instruct"  # Using Qwen 2 72B for better performance
            logger.info("✅ Groq LLM initialized with Qwen 2 72B")
        except Exception as e:
            logger.warning(f"⚠️ Groq initialization failed: {e}. LLM features will be limited.")
            self.client = None
            self.model = None
    
    async def chat_completion(
        self,
        query: str,
        chat_history: List[Dict[str, str]] = None,
        use_rag: bool = True
    ) -> str:
        """
        Generate chatbot response
        
        Args:
            query: User query
            chat_history: Previous messages
            use_rag: Whether to retrieve context from ChromaDB
        """
        if not self.client:
            return "LLM service is currently unavailable. Please check the configuration."
        
        try:
            # Retrieve relevant context if RAG enabled
            context = ""
            if use_rag:
                search_results = chroma_client.search(query, n_results=3)
                if search_results['documents']:
                    context = "\n\n".join(search_results['documents'][0])
            
            # Build system prompt
            system_prompt = """You are a helpful textile compliance expert assistant for SCAP (Supply Chain AI Compliance Platform).
You help suppliers understand compliance requirements, certificates, and regulations.
Answer questions clearly and concisely. If you don't know something, say so.
Focus on practical, actionable advice."""

            if context:
                system_prompt += f"\n\nRelevant context:\n{context}"
            
            # Build messages
            messages = [{"role": "system", "content": system_prompt}]
            
            if chat_history:
                messages.extend(chat_history)
            
            messages.append({"role": "user", "content": query})
            
            # Generate response
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1024
            )
            
            answer = response.choices[0].message.content
            logger.info(f"✅ Generated response ({len(answer)} chars)")
            return answer
            
        except Exception as e:
            logger.error(f"❌ LLM chat failed: {e}")
            raise
    
    async def stream_chat_completion(
        self,
        query: str,
        chat_history: List[Dict[str, str]] = None
    ) -> AsyncGenerator[str, None]:
        """Stream chatbot response for real-time typing effect"""
        try:
            system_prompt = """You are a helpful textile compliance expert assistant.
Answer questions clearly and concisely."""
            
            messages = [{"role": "system", "content": system_prompt}]
            if chat_history:
                messages.extend(chat_history)
            messages.append({"role": "user", "content": query})
            
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1024,
                stream=True
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            logger.error(f"❌ LLM streaming failed: {e}")
            raise


# Global instance
llm_service = LLMService()
