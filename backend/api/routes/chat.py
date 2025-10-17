"""
AI chatbot endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from datetime import datetime
from bson import ObjectId

from services.llm_service import llm_service
from services.document_ai_service import document_ai_service
from database.mongodb import get_database
from api.middleware.auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    language: str = "en"  # en, ta, hi
    chat_history: List[ChatMessage] = []
    use_reasoning: bool = False  # Use DeepSeek for complex reasoning


@router.post("/message")
async def send_message(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """Send message to chatbot and get response"""
    try:
        # Translate to English if needed
        query = request.message
        if request.language != "en":
            logger.info(f"Translating from {request.language} to English")
            query = document_ai_service.translate_text(query, "en")
        
        # Convert chat history to dict format
        history = [{"role": msg.role, "content": msg.content} for msg in request.chat_history]
        
        # Get response from LLM service
        try:
            response = await llm_service.chat_completion(
                query=query,
                chat_history=history,
                use_rag=True,
                use_reasoning=request.use_reasoning
            )
        except Exception as llm_error:
            logger.warning(f"LLM service error: {llm_error}, using fallback")
            # Fallback to Gemini if Groq fails
            try:
                response = document_ai_service.generate_compliance_response(query)
            except Exception as fallback_error:
                logger.error(f"Fallback also failed: {fallback_error}")
                response = f"I apologize, but I'm having trouble processing your request right now. Your question was: '{request.message}'. Please try again in a moment or contact support if the issue persists."
        
        # Store in chat history
        db = get_database()
        
        # Use a default user_id if not available
        user_id = current_user.get("user_id", "test_user")
        
        await db.chat_history.update_one(
            {"supplier_id": user_id},
            {
                "$push": {
                    "messages": {
                        "$each": [
                            {
                                "role": "user",
                                "content": request.message,
                                "timestamp": datetime.utcnow(),
                                "language": request.language
                            },
                            {
                                "role": "assistant",
                                "content": response,
                                "timestamp": datetime.utcnow(),
                                "language": request.language
                            }
                        ]
                    }
                },
                "$setOnInsert": {"created_at": datetime.utcnow()}
            },
            upsert=True
        )
        
        logger.info(f"✅ Chat response generated for {current_user['user_id']}")
        
        return {
            "response": response,
            "language": request.language
        }
        
    except Exception as e:
        logger.error(f"❌ Chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{supplier_id}")
async def get_chat_history(
    supplier_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get chat history for supplier"""
    # Verify ownership
    if current_user["user_id"] != supplier_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db = get_database()
    history = await db.chat_history.find_one({"supplier_id": supplier_id})
    
    if not history:
        return {"supplier_id": supplier_id, "messages": []}
    
    history["_id"] = str(history["_id"])
    return history


@router.delete("/history/{supplier_id}")
async def clear_chat_history(
    supplier_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Clear chat history"""
    if current_user["user_id"] != supplier_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db = get_database()
    await db.chat_history.delete_one({"supplier_id": supplier_id})
    
    return {"message": "Chat history cleared"}
