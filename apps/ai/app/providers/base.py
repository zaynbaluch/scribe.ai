from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, Generator

class LLMProvider(ABC):
    """Abstract base class for all LLM providers."""

    @abstractmethod
    def generate(self, prompt: str, system: Optional[str] = None, tools: Optional[list] = None, **kwargs) -> str:
        """Generate a complete string response."""
        pass

    @abstractmethod
    def stream(self, prompt: str, system: Optional[str] = None, **kwargs) -> Generator[str, None, None]:
        """Stream the generated response back in chunks."""
        pass

    def generate_json(self, prompt: str, system: Optional[str] = None, **kwargs) -> dict:
        """Generate a JSON response. Override for providers that support JSON mode natively."""
        import json
        raw = self.generate(prompt, system=system, **kwargs)
        # Try to extract JSON from the response
        raw = raw.strip()
        # Handle markdown code blocks
        if raw.startswith("```json"):
            raw = raw[7:]
        if raw.startswith("```"):
            raw = raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]
        return json.loads(raw.strip())
