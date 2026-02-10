from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from services.api.core.database import get_db_context
from services.api.core.prompts import SYSTEM_PROMPT_BAYO, SYSTEM_PROMPT_CHIOMA, SYSTEM_PROMPT_KEMI
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/guidance", tags=["guidance"])

# --- Schemas ---
class Message(BaseModel):
    role: Literal['user', 'assistant', 'system']
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    persona: Literal['bayo', 'chioma', 'kemi']
    history: List[Message] = []

class ChatResponse(BaseModel):
    role: str = "assistant"
    content: str
    persona: str

# --- RAG Logic (Simple Keyword Match for MVP) ---
async def retrieve_context(query: str, supabase) -> str:
    """
    Simple RAG: Searches 'programs' table for keywords in the query.
    Returns a formatted string of context data.
    """
    try:
        # 1. Extract potential keywords (very naive for MVP)
        # In a real app, use vector embeddings (pgvector).
        keywords = [w for w in query.split() if len(w) > 4] # Ignore small words
        
        context_lines = []
        
        if not keywords:
            return ""

        # 2. Search Programs (Limit 3)
        # We'll just search the first keyword for now to avoid complex OR logic in simple client
        search_term = keywords[0]
        
        response = supabase.table('programs') \
            .select('name, university_name, description') \
            .ilike('name', f'%{search_term}%') \
            .limit(3) \
            .execute()
            
        programs = response.data
        
        if programs:
            context_lines.append("Here is relevant data from the official database:")
            for p in programs:
                context_lines.append(f"- Program: {p['name']} at {p['university_name']}")
                if p.get('description'):
                   context_lines.append(f"  Details: {p['description'][:100]}...")
        
        return "\n".join(context_lines)

    except Exception as e:
        logger.error(f"RAG Retrieval Error: {e}")
        return "" # Fail gracefully with no context

# --- Mock LLM (Placeholder for Phase 2) ---
# In production, this would call OpenAI/Anthropic/Gemini
def generate_llm_response(persona: str, user_message: str, context: str) -> str:
    """
    MOCK LLM: Generates a static response based on persona and context.
    Real LLM integration comes in next step.
    """
    base_response = ""
    
    if persona == 'bayo':
        base_response = f"Analyzing your request: '{user_message}'.\n\n"
        if context:
            base_response += f"Based on the data:\n{context}\n\n"
            base_response += "Strategy: These options align with your profile. The probability is moderate."
        else:
            base_response += "I found no matching records in the database. I cannot give a strategic assessment without data."
            
    elif persona == 'chioma':
        base_response = f"Hello! 🌟 I hear you asking about '{user_message}'. "
        if context:
            base_response += f"Good news! We have some info:\n{context}\n\n"
            base_response += "You have so much potential here! ❤️ Let's explore these steps together."
        else:
            base_response += "I couldn't find specific details just yet, but don't worry! We can look closer or try a different search. You've got this!"
            
    elif persona == 'kemi':
        base_response = f"Received: '{user_message}'.\n"
        if context:
            base_response += f"FACTS:\n{context}\n\n"
            base_response += "ACTION ITEMS:\n1. Review these requirements.\n2. Apply immediately if eligible.\n3. Report back."
        else:
            base_response += "NO DATA FOUND. Go check the brochure or refine your search terms immediately. Do not waste time."

    return base_response

# --- Endpoint ---
@router.post("/chat", response_model=ChatResponse)
async def chat_with_counselor(
    request: ChatRequest,
    context = Depends(get_db_context)
):
    user_id = context['user'].id
    supabase = context['supabase']
    
    # 1. Retrieve Context (RAG)
    rag_context = await retrieve_context(request.message, supabase)
    
    # 2. Generate Response (Mock LLM)
    # In real implementation:
    # system_prompt = get_system_prompt(request.persona)
    # full_prompt = f"{system_prompt}\n\nCONTEXT:\n{rag_context}\n\nUSER: {request.message}"
    # response = call_llm(full_prompt)
    
    ai_response_content = generate_llm_response(request.persona, request.message, rag_context)
    
    return ChatResponse(
        role="assistant",
        content=ai_response_content,
        persona=request.persona
    )
