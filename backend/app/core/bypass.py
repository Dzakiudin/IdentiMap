import random
import time

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
]

class BypassManager:
    """
    Handles Proxy rotation, User-Agent spoofing, and timing delays to bypass scraping detection.
    """
    def __init__(self, proxies: list[str] = None):
        self.proxies = proxies or []
        self._current_proxy_idx = 0

    def get_random_headers(self) -> dict:
        return {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
        }

    def get_next_proxy(self) -> dict:
        if not self.proxies:
            return {}
            
        proxy = self.proxies[self._current_proxy_idx]
        self._current_proxy_idx = (self._current_proxy_idx + 1) % len(self.proxies)
        
        return {
            "http": proxy,
            "https": proxy
        }

    def sleep_random(self, min_sec=1.0, max_sec=3.0):
        time.sleep(random.uniform(min_sec, max_sec))

bypass_manager = BypassManager()
