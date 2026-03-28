from typing import Dict, Any
import aiohttp
from app.engines.base import BaseEngine

class BreachEngine(BaseEngine):
    """
    Checks if a target's email or phone exists in massive data breaches.
    Currently utilizes the ProxyNova COMB (Compilation of Many Breaches) public API 
    which indexes 3.2 billion leaked records.
    """
    def __init__(self):
        super().__init__()
        self.comb_url = "https://api.proxynova.com/comb?query="

    async def execute(self, target_data: Dict[str, Any]) -> Dict[str, Any]:
        email = target_data.get("email")
        # COMB works primarily well with emails 
        if not email:
            return {"engine": self.name, "status": "skipped", "reason": "No email provided for breach check"}

        result = {
            "engine": self.name,
            "status": "success",
            "email": email,
            "breaches_found": False,
            "leak_count": 0,
            "leaked_data": []
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.comb_url + email, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        lines = data.get("lines", [])
                        
                        if lines:
                            result["breaches_found"] = True
                            result["leak_count"] = len(lines)
                            
                            # Parse the returned lines. Format is usually email:password or email:hash
                            for line in lines:
                                parts = line.split(":", 1)
                                if len(parts) == 2:
                                    # Mask the password/hash slightly for safety and visual effect
                                    sensitive_data = parts[1]
                                    if len(sensitive_data) > 3:
                                        masked = sensitive_data[:2] + ("*" * (len(sensitive_data)-3)) + sensitive_data[-1:]
                                    else:
                                        masked = "***"
                                        
                                    result["leaked_data"].append({
                                        "email": parts[0],
                                        "compromised_data": masked
                                    })
                    elif response.status == 404:
                         # No breaches found in COMB
                         pass
                    else:
                        result["status"] = "error"
                        result["reason"] = f"API returned status {response.status}"
                        
        except Exception as e:
            result["status"] = "error"
            result["reason"] = str(e)
            
        return result
