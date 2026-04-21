import os
from loguru import logger
from .base import LLMProvider
from .ollama import OllamaProvider

def get_llm_provider() -> LLMProvider:
    provider = os.getenv("LLM_PROVIDER", "ollama").lower()
    
    if provider == "ollama":
        return OllamaProvider()
    elif provider == "openai":
        # Placeholder for OpenAIProvider
        logger.warning("OpenAI provider not yet fully implemented, falling back to Ollama")
        return OllamaProvider()
    elif provider == "groq":
        # Placeholder for GroqProvider
        logger.warning("Groq provider not yet fully implemented, falling back to Ollama")
        return OllamaProvider()
    else:
        logger.warning(f"Unknown provider: {provider}, falling back to Ollama")
        return OllamaProvider()
