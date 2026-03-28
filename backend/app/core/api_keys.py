from typing import Dict, List, Optional
import os

class ApiFailoverManager:
    """
    Manages API keys for various services. If one fails (Rate Limit), it transitions to the next available.
    """
    def __init__(self):
        # Example storage format: {"google_search": ["key1", "key2"], "numverify": ["key1"]}
        self.api_keys: Dict[str, List[str]] = {
            "google_search": [],
            "numverify": []
        }
        self.current_idx: Dict[str, int] = {}
        
        self._load_from_env()

    def _load_from_env(self):
        # For simplicity, comma separated from .env or environment
        if os.getenv("GOOGLE_API_KEYS"):
            self.api_keys["google_search"] = os.getenv("GOOGLE_API_KEYS").split(",")
        if os.getenv("NUMVERIFY_KEYS"):
            self.api_keys["numverify"] = os.getenv("NUMVERIFY_KEYS").split(",")
            
        for srv in self.api_keys:
            self.current_idx[srv] = 0

    def get_key(self, service: str) -> Optional[str]:
        keys = self.api_keys.get(service, [])
        if not keys:
            return None
        return keys[self.current_idx[service]]

    def report_failure(self, service: str, key: str):
        """Called when an API key gets a 429 Too Many Requests, rotates to the next key."""
        keys = self.api_keys.get(service, [])
        if keys:
            self.current_idx[service] = (self.current_idx[service] + 1) % len(keys)
            print(f"[WARN] Switching API key for {service} to index {self.current_idx[service]}")

api_manager = ApiFailoverManager()
