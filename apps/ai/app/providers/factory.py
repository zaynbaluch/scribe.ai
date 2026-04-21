import os
from loguru import logger
from .base import LLMProvider
from .ollama import OllamaProvider

def get_llm_provider() -> LLMProvider:
    provider = os.getenv("LLM_PROVIDER", "ollama").lower()

    if provider == "ollama":
        return OllamaProvider()
    elif provider == "openai":
        from .openai_provider import OpenAIProvider
        return OpenAIProvider()
    elif provider == "groq":
        # Groq uses the OpenAI-compatible API
        from .openai_provider import OpenAIProvider
        os.environ.setdefault("LLM_BASE_URL", "https://api.groq.com/openai/v1")
        return OpenAIProvider()
    else:
        logger.warning(f"Unknown provider: {provider}, falling back to Ollama")
        return OllamaProvider()
