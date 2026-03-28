from typing import Dict, Any
import asyncio
import re
from app.engines.base import BaseEngine

class EmailEngine(BaseEngine):
    """
    Checks if an email is registered on various websites using the Holehe OSINT module.
    """
    def __init__(self):
        super().__init__()

    async def execute(self, target_data: Dict[str, Any]) -> Dict[str, Any]:
        email = target_data.get("email")
        if not email:
            return {"engine": self.name, "status": "skipped", "reason": "No email provided"}

        result = {
            "engine": self.name,
            "status": "success",
            "email": email,
            "registered_sites": []
        }

        try:
            # Run holehe as a subprocess to avoid trio/asyncio loop conflicts
            # Using --only-used to only get positive results, and --no-color for easy parsing
            cmd = f'holehe "{email}" --only-used --no-color'
            process = await asyncio.create_subprocess_shell(
                cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                result["status"] = "error"
                result["reason"] = f"Holehe execution failed: {stderr.decode()}"
                return result
                
            output = stdout.decode(errors='ignore')
            
            # Parse holehe output
            # Successfully registered sites usually start with [+]
            for line in output.split('\n'):
                line = line.strip()
                if line.startswith("[+]"):
                    # Extract the site name after [+]
                    site_name = line.replace("[+]", "").strip()
                    # Clean up if there are any extra characters or emojis
                    site_name = re.sub(r'[\x00-\x1f\x7f-\x9f]|(Email used)', '', site_name).strip()
                    if site_name:
                        result["registered_sites"].append(site_name)
                        
        except Exception as e:
            result["status"] = "error"
            result["reason"] = str(e)
            
        return result
