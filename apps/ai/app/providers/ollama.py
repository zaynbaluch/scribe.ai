import ollama
from typing import Optional, Generator
from loguru import logger
from .base import LLMProvider
import os

class OllamaProvider(LLMProvider):
    def __init__(self):
        self.model = os.getenv("LLM_MODEL", "mistral:latest")
        self.base_url = os.getenv("LLM_BASE_URL", "http://localhost:11434")
        self.client = ollama.Client(host=self.base_url)
        logger.info(f"Initialized OllamaProvider with model {self.model} at {self.base_url}")

    def generate(self, prompt: str, system: Optional[str] = None, tools: Optional[list] = None, **kwargs) -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        response = self.client.chat(model=self.model, messages=messages, tools=tools, format='json')
        return response.get('message', {}).get('content', '')

    def stream(self, prompt: str, system: Optional[str] = None, **kwargs) -> Generator[str, None, None]:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        for chunk in self.client.chat(model=self.model, messages=messages, stream=True):
            yield chunk.get('message', {}).get('content', '')
