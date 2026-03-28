import io
from typing import Dict, Any
import aiohttp
from PIL import Image
import exifread
from app.engines.base import BaseEngine

class ImageEngine(BaseEngine):
    """
    Downloads an image from a URL, reads its EXIF metadata (Geotags, Camera info),
    and performs a simulated reverse search check.
    """
    async def execute(self, target_data: Dict[str, Any]) -> Dict[str, Any]:
        image_url = target_data.get("image_url")
        if not image_url:
            return {"engine": self.name, "status": "skipped", "reason": "No image_url provided"}

        result = {
            "engine": self.name,
            "status": "success",
            "image_url": image_url,
            "has_exif": False,
            "exif_data": {},
            "dimensions": None,
            "reverse_search_dorks": []
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(image_url, timeout=15) as response:
                    if response.status == 200:
                        image_bytes = await response.read()
                        
                        # Use PIL to get basic info
                        with Image.open(io.BytesIO(image_bytes)) as img:
                            result["dimensions"] = f"{img.width}x{img.height}"
                            result["format"] = img.format
                        
                        # Extract EXIF
                        tags = exifread.process_file(io.BytesIO(image_bytes), details=False)
                        if tags:
                            result["has_exif"] = True
                            important_tags = [
                                "Image Make", "Image Model", "Image DateTime", 
                                "Image Software", "GPS GPSLatitude", "GPS GPSLongitude"
                            ]
                            for tag in important_tags:
                                if tag in tags:
                                    result["exif_data"][tag] = str(tags[tag])
                        
                        # Generate Reverse Image Dorks
                        result["reverse_search_dorks"] = [
                            f"https://lens.google.com/uploadbyurl?url={image_url}",
                            f"https://yandex.com/images/search?rpt=imageview&url={image_url}"
                        ]
                    else:
                        result["status"] = "error"
                        result["reason"] = f"Failed to download image, status {response.status}"
        except Exception as e:
            result["status"] = "error"
            result["reason"] = str(e)
            
        return result
