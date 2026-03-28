from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseEngine(ABC):
    """
    Base class for all OSINT Reconnaissance Engines.
    """
    def __init__(self):
        self.name = self.__class__.__name__

    @abstractmethod
    async def execute(self, target_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the engine's search logic.
        target_data: Dict containing 'real_name', 'username', 'phone', etc.
        Returns: A dictionary containing the findings and confidence scores.
        """
        pass
