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
