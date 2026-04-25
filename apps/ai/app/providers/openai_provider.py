import openai
from typing import Optional, Generator
from loguru import logger
from .base import LLMProvider
import os
import json

class OpenAIProvider(LLMProvider):
    def __init__(self):
        # Support multiple models as a comma-separated list
        model_str = os.getenv("LLM_MODEL", "gpt-4o-mini")
        self.models = [m.strip() for m in model_str.split(",") if m.strip()]
        self.api_key = os.getenv("LLM_API_KEY", "")
        self.base_url = os.getenv("LLM_BASE_URL")
        
        client_kwargs = {"api_key": self.api_key}
        if self.base_url:
            client_kwargs["base_url"] = self.base_url
            
        self.client = openai.OpenAI(**client_kwargs)
        logger.info(f"Initialized OpenAIProvider with models {self.models} (Base URL: {self.base_url})")

    def _get_completion(self, messages: list, is_json: bool = False, **kwargs) -> str:
        last_error = None
        for model in self.models:
            try:
                logger.info(f"Attempting generation with model: {model}")
                response_format = {"type": "json_object"} if is_json else None
                
                response = self.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=kwargs.get("temperature", 0.7 if not is_json else 0.3),
                    max_tokens=kwargs.get("max_tokens", 4096),
                    response_format=response_format
                )
                return response.choices[0].message.content or ("{}" if is_json else "")
            except openai.RateLimitError as e:
                logger.warning(f"Rate limit hit for model {model}: {str(e)}. Trying next model...")
                last_error = e
                continue
            except Exception as e:
                logger.error(f"Error with model {model}: {str(e)}")
                last_error = e
                # For non-rate-limit errors, we might still want to try other models if it's a provider issue
                if "model_not_found" in str(e).lower() or "overloaded" in str(e).lower():
                    continue
                raise e
        
        if last_error:
            raise last_error
        return "{}" if is_json else ""

    def generate(self, prompt: str, system: Optional[str] = None, **kwargs) -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        return self._get_completion(messages, is_json=False, **kwargs)

    def stream(self, prompt: str, system: Optional[str] = None, **kwargs) -> Generator[str, None, None]:
        # Streaming fallback is harder, so we just use the first model for now
        # or we could implement similar logic if we really need to.
        # But for resume parsing, we mostly use generate_json.
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        try:
            stream = self.client.chat.completions.create(
                model=self.models[0],
                messages=messages,
                temperature=kwargs.get("temperature", 0.7),
                max_tokens=kwargs.get("max_tokens", 2048),
                stream=True,
            )
            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"Streaming error: {str(e)}")
            yield f"Error: {str(e)}"

    def generate_json(self, prompt: str, system: Optional[str] = None, **kwargs) -> dict:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        raw = self._get_completion(messages, is_json=True, **kwargs)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            logger.error(f"Failed to decode JSON: {raw}")
            return {}
