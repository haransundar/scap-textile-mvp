"""
LLM service for chatbot using multiple models:
- Qwen 2 72B (Groq) - Primary chatbot
- DeepSeek-R1 (Groq) - Complex reasoning
- Gemma 3 9B (OpenRouter) - Fallback
"""
from groq import Groq
from utils.config import settings
import logging
from typing import List, Dict, AsyncGenerator
from database.chroma_db import chroma_client
import requests

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self):
        # Initialize Groq client with available models
        try:
            self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
            # Updated to use available models
            self.primary_model = "llama-3.3-70b-versatile"  # Fast and versatile
            self.reasoning_model = "qwen/qwen3-32b"  # For complex reasoning
            logger.info("✅ Groq LLM initialized (Llama 3.3 70B + Qwen3 32B)")
        except Exception as e:
            logger.warning(f"⚠️ Groq initialization failed: {e}")
            self.groq_client = None
            self.primary_model = None
            self.reasoning_model = None
        
        # Initialize OpenRouter for Gemma fallback
        try:
            self.openrouter_key = settings.OPENROUTER_API_KEY
            self.fallback_model = "google/gemma-2-9b-it:free"
            logger.info("✅ OpenRouter initialized (Gemma 3 9B fallback)")
        except Exception as e:
            logger.warning(f"⚠️ OpenRouter initialization failed: {e}")
            self.openrouter_key = None
            self.fallback_model = None
    
    async def chat_completion(
        self,
        query: str,
        chat_history: List[Dict[str, str]] = None,
        use_rag: bool = True,
        use_reasoning: bool = False
    ) -> str:
        """
        Generate chatbot response with automatic fallback
        
        Args:
            query: User query
            chat_history: Previous messages
            use_rag: Whether to retrieve context from ChromaDB
            use_reasoning: Whether to use DeepSeek for complex reasoning
        """
        # Try primary models first (Groq)
        if self.groq_client:
            try:
                if use_reasoning and self.reasoning_model:
                    return await self._deepseek_reasoning(query, chat_history, use_rag)
                else:
                    return await self._qwen_chat(query, chat_history, use_rag)
            except Exception as e:
                logger.warning(f"⚠️ Groq failed: {e}, trying fallback")
        
        # Fallback to Gemma via OpenRouter
        if self.openrouter_key:
            try:
                return await self._gemma_fallback(query, chat_history)
            except Exception as e:
                logger.warning(f"⚠️ OpenRouter fallback failed: {e}")
        
        return "I apologize, but I'm currently unable to process your request. Please try again later."
    
    async def _qwen_chat(
        self,
        query: str,
        chat_history: List[Dict[str, str]] = None,
        use_rag: bool = True
    ) -> str:
        """Generate response using Qwen 2 72B"""
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
            response = self.groq_client.chat.completions.create(
                model=self.primary_model,
                messages=messages,
                temperature=0.7,
                max_tokens=1024
            )
            
            answer = response.choices[0].message.content
            logger.info(f"✅ Qwen generated response ({len(answer)} chars)")
            return answer
            
        except Exception as e:
            logger.error(f"❌ Qwen chat failed: {e}")
            raise
    
    async def _deepseek_reasoning(
        self,
        query: str,
        chat_history: List[Dict[str, str]] = None,
        use_rag: bool = True
    ) -> str:
        """Generate response using DeepSeek-R1 for complex reasoning"""
        try:
            # Retrieve more context for reasoning tasks
            context = ""
            if use_rag:
                search_results = chroma_client.search(query, n_results=5)
                if search_results['documents']:
                    context = "\n\n".join(search_results['documents'][0])
            
            # Build system prompt for reasoning
            system_prompt = """You are an expert compliance analyst for SCAP (Supply Chain AI Compliance Platform).
You specialize in complex supply chain compliance reasoning, regulatory analysis, and risk assessment.
Provide detailed, analytical responses with step-by-step reasoning.
Consider multiple perspectives and potential implications."""

            if context:
                system_prompt += f"\n\nRelevant context:\n{context}"
            
            # Build messages
            messages = [{"role": "system", "content": system_prompt}]
            
            if chat_history:
                messages.extend(chat_history[-5:])  # Fewer messages for focused reasoning
            
            messages.append({"role": "user", "content": query})
            
            # Generate response with DeepSeek
            response = self.groq_client.chat.completions.create(
                model=self.reasoning_model,
                messages=messages,
                temperature=0.3,  # Lower temperature for more focused reasoning
                max_tokens=1500
            )
            
            answer = response.choices[0].message.content
            logger.info(f"✅ DeepSeek generated reasoning response ({len(answer)} chars)")
            return answer
            
        except Exception as e:
            logger.error(f"❌ DeepSeek reasoning failed: {e}")
            # Fallback to regular Qwen
            return await self._qwen_chat(query, chat_history, use_rag)
    
    async def _gemma_fallback(
        self,
        query: str,
        chat_history: List[Dict[str, str]] = None
    ) -> str:
        """Fallback to Gemma 3 via OpenRouter"""
        try:
            # Build system prompt
            system_prompt = """You are a helpful AI assistant for SCAP (Supply Chain AI Compliance Platform).
You help with textile compliance, certifications, and supply chain questions.
Provide concise, helpful responses."""
            
            # Build messages
            messages = [{"role": "system", "content": system_prompt}]
            
            if chat_history:
                messages.extend(chat_history[-3:])  # Limited history for fallback
            
            messages.append({"role": "user", "content": query})
            
            # Call OpenRouter API
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openrouter_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.fallback_model,
                    "messages": messages,
                    "max_tokens": 800,
                    "temperature": 0.7
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                answer = result['choices'][0]['message']['content']
                logger.info(f"✅ Gemma fallback generated response ({len(answer)} chars)")
                return answer
            else:
                logger.error(f"❌ OpenRouter API error: {response.status_code}")
                raise Exception(f"OpenRouter API error: {response.status_code}")
                
        except Exception as e:
            logger.error(f"❌ Gemma fallback failed: {e}")
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
            
            stream = self.groq_client.chat.completions.create(
                model=self.primary_model,
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
