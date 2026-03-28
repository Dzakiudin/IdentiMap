from typing import Dict, Any
from app.engines.base import BaseEngine
import urllib.parse
from app.core.bypass import bypass_manager
import aiohttp
from bs4 import BeautifulSoup

class DorkEngine(BaseEngine):
    """
    Constructs Google Dorks based on target data and scrapes snippets.
    """
    def __init__(self):
        super().__init__()

    async def execute(self, target_data: Dict[str, Any]) -> Dict[str, Any]:
        keywords = []
        if target_data.get("real_name"):
            keywords.append(f'"{target_data["real_name"]}"')
        if target_data.get("address"):
            # Simple keyword extraction, taking a few words
            parts = target_data["address"].split()
            if parts:
                keywords.append(parts[0]) 

        if not keywords:
             return {"engine": self.name, "status": "skipped", "reason": "Insufficient data for dorking"}
             
        query = " AND ".join(keywords)
        
        # Adding age/dob to query if present
        if target_data.get("dob"):
            year = target_data["dob"].split()[-1] # Usually year is at the end "29 April 2007"
            if len(year) == 4 and year.isdigit():
                query += f' AND "{year}"'

        url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query)
        
        # We use duckduckgo HTML for easier scraping compared to Google WAF
        headers = bypass_manager.get_random_headers()
        
        results = []
        try:
            bypass_manager.sleep_random(1.0, 2.0)
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status == 200:
                        html = await response.text()
                        soup = BeautifulSoup(html, 'html.parser')
                        for a in soup.find_all('a', class_='result__url', limit=5):
                            results.append(a.get('href'))
        except Exception as e:
            return {"engine": self.name, "status": "error", "error": str(e)}

        return {
            "engine": self.name,
            "status": "success",
            "dork_query": query,
            "found_links": results
        }
