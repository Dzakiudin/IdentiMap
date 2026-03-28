from typing import Dict, Any
import phonenumbers
from phonenumbers import geocoder, carrier, timezone
from app.engines.base import BaseEngine
from app.core.api_keys import api_manager
import aiohttp

class PhoneEngine(BaseEngine):
    """
    Analyzes phone numbers extracting location, carrier, and querying OSINT DBs.
    """
    def __init__(self):
        super().__init__()

    async def execute(self, target_data: Dict[str, Any]) -> Dict[str, Any]:
        raw_phone = target_data.get("phone")
        if not raw_phone:
            return {"engine": self.name, "status": "skipped", "reason": "No phone number provided"}

        result = {
            "engine": self.name,
            "status": "success",
            "raw_number": raw_phone,
            "is_valid": False,
            "info": {},
            "accounts": []
        }

        try:
            # Add '+' if missing for international parsing
            if not raw_phone.startswith("+"):
                raw_phone = "+" + raw_phone
                
            parsed_num = phonenumbers.parse(raw_phone, None)
            result["is_valid"] = phonenumbers.is_valid_number(parsed_num)
            
            if result["is_valid"]:
                result["info"] = {
                    "country": geocoder.description_for_number(parsed_num, "en"),
                    "carrier": carrier.name_for_number(parsed_num, "en"),
                    "timezones": list(timezone.time_zones_for_number(parsed_num)),
                    "formatted": phonenumbers.format_number(parsed_num, phonenumbers.PhoneNumberFormat.INTERNATIONAL)
                }
                
                # Here we could query an API like Numverify if we have a key
                api_key = api_manager.get_key("numverify")
                if api_key:
                    # Async request to numverify or similar
                    async with aiohttp.ClientSession() as session:
                        url = f"http://apilayer.net/api/validate?access_key={api_key}&number={raw_phone.replace('+', '')}"
                        async with session.get(url) as resp:
                            if resp.status == 200:
                                data = await resp.json()
                                if data.get("valid"):
                                    result["info"]["line_type"] = data.get("line_type")
                                    result["info"]["location"] = data.get("location")
                                elif data.get("error"):
                                    api_manager.report_failure("numverify", api_key)
                                    
        except phonenumbers.phonenumberutil.NumberParseException as e:
            result["status"] = "error"
            result["reason"] = str(e)
            
        return result
