import aiohttp
import asyncio
from typing import Dict, Any
from app.engines.base import BaseEngine
from app.core.bypass import bypass_manager
from playwright.async_api import async_playwright

class UsernameEngine(BaseEngine):
    """
    Checks the existence of a username across various social platforms.
    """
    def __init__(self):
        super().__init__()
        # Simplified sites for OSINT Username tracking
        self.sites = {
            "Instagram": "https://www.instagram.com/{}/",
            "Twitter": "https://nitter.net/{}", # Alternative to Twitter UI
            "TikTok": "https://www.tiktok.com/@{}",
            "GitHub": "https://github.com/{}",
            "Reddit": "https://www.reddit.com/user/{}/about.json"
        }

    async def check_site(self, session: aiohttp.ClientSession, site_name: str, url_template: str, username: str) -> Dict[str, Any]:
        url = url_template.format(username)
        headers = bypass_manager.get_random_headers()
        try:
            # Using random delays to bypass WAF
            bypass_manager.sleep_random(0.5, 1.5)
            async with session.get(url, headers=headers, timeout=10) as response:
                if response.status == 200:
                    # Specific check for reddit API
                    if "reddit.com" in url:
                        data = await response.json()
                        if "error" in data:
                            return {"site": site_name, "found": False, "url": None}
                    
                    return {"site": site_name, "found": True, "url": url}
                elif response.status in [403, 429]:
                    # Trigger Headless Playwright Bypass
                    try:
                        async with async_playwright() as p:
                            browser = await p.chromium.launch(headless=True)
                            context = await browser.new_context(
                                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                            )
                            page = await context.new_page()
                            await page.goto(url, timeout=15000)
                            content = await page.content()
                            title = await page.title()
                            await browser.close()
                            
                            # Basic heuristic to verify existence on headless load
                            if "Not Found" not in title and "Page not found" not in content and len(content) > 1000:
                                return {"site": site_name + " (Bypassed)", "found": True, "url": url}
                    except Exception:
                        pass
                
                return {"site": site_name, "found": False, "url": None}
        except Exception as e:
            return {"site": site_name, "found": False, "error": str(e), "url": None}

    async def execute(self, target_data: Dict[str, Any]) -> Dict[str, Any]:
        username_str = target_data.get("username")
        if not username_str:
            return {"engine": self.name, "status": "skipped", "reason": "No username provided"}

        # Handle multiple comma separated usernames
        usernames = [u.strip() for u in username_str.split(",")]
        
        results = []
        async with aiohttp.ClientSession() as session:
            tasks = []
            for uname in usernames:
                for site_name, url_template in self.sites.items():
                    tasks.append(self.check_site(session, site_name, url_template, uname))
                    
            results = await asyncio.gather(*tasks)

        found_accounts = [r for r in results if r.get("found")]
        return {
            "engine": self.name,
            "status": "success",
            "total_checked": len(self.sites) * len(usernames),
            "found_count": len(found_accounts),
            "accounts": found_accounts
        }
