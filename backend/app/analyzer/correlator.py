from typing import Dict, Any, List
from app.engines.username_engine import UsernameEngine
from app.engines.phone_engine import PhoneEngine
from app.engines.dork_engine import DorkEngine
from app.engines.email_engine import EmailEngine
from app.engines.breach_engine import BreachEngine
from app.engines.image_engine import ImageEngine

class ProfileCorrelator:
    """
    Correlates findings across different engines and assigns a subjective "Confidence Score".
    """
    def __init__(self):
        self.username_engine = UsernameEngine()
        self.phone_engine = PhoneEngine()
        self.dork_engine = DorkEngine()
        self.email_engine = EmailEngine()
        self.breach_engine = BreachEngine()
        self.image_engine = ImageEngine()

    async def profile(self, target: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs the full pipeline.
        target example: {"real_name": "John", "username": "johnny123", "phone": "+1234", "dob": "2000", "address": "NY"}
        """
        # Run modules sequentially for simplicity, but could be asyncio.gather
        username_res = await self.username_engine.execute(target)
        phone_res = await self.phone_engine.execute(target)
        dork_res = await self.dork_engine.execute(target)
        email_res = await self.email_engine.execute(target)
        breach_res = await self.breach_engine.execute(target)
        image_res = await self.image_engine.execute(target)
        
        # Scoring logic
        confidence = 0
        matches = []
        
        # Username matches
        if username_res.get("found_count", 0) > 0:
            confidence += 40
            for acc in username_res.get("accounts", []):
                acc['score'] = 50 # Baseline for a common username hit
                matches.append(acc)

        # Phone analysis
        if phone_res.get("is_valid"):
            confidence += 20
            # If dorking found phone inside results, drastically increase confidence
            found_phone_in_dorks = False
            for d in dork_res.get("found_links", []):
                if target.get("phone")[-5:] in d:
                    found_phone_in_dorks = True
            if found_phone_in_dorks:
                confidence += 30
                
        # Dork analysis
        dork_links = dork_res.get("found_links", [])
        if dork_links:
            confidence += 10
            
        # Email analysis
        registered_sites = email_res.get("registered_sites", [])
        if registered_sites:
            confidence += 20
            # Automatically add to matches for UI visibility
            for site in registered_sites:
                matches.append({
                    "site": f"Email Match: {site}",
                    "found": True,
                    "url": f"Registered via {target.get('email')}",
                    "score": 40
                })
                
        # Breach Analysis
        if breach_res.get("breaches_found"):
            confidence += 30  # High confidence if target leaked their data
            matches.append({
                "site": "Data Breach Leak",
                "found": True,
                "url": f"{breach_res.get('leak_count')} COMB leaked records found",
                "score": 50
            })
            
        # Image Analysis
        if image_res.get("has_exif"):
            confidence += 15
            matches.append({
                "site": "Image EXIF Extracted",
                "found": True,
                "url": f"Metadata tracked from {target.get('image_url')}",
                "score": 30
            })
        
        return {
            "target": target,
            "overall_confidence_score": min(confidence, 100),
            "findings": {
                "usernames": username_res,
                "phone_info": phone_res,
                "web_footprints": dork_res,
                "email_info": email_res,
                "breach_info": breach_res,
                "image_intel": image_res
            },
            "matches": matches
        }

correlator = ProfileCorrelator()
