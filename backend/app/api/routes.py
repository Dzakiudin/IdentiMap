from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.analyzer.correlator import ProfileCorrelator

router = APIRouter()

class TargetData(BaseModel):
    real_name: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    dob: Optional[str] = None
    address: Optional[str] = None
    email: Optional[str] = None
    image_url: Optional[str] = None

@router.post("/scan")
async def run_scan(target: TargetData):
    correlator = ProfileCorrelator()
    target_dict = {k: v for k, v in target.dict().items() if v is not None}
    
    if not target_dict:
        raise HTTPException(status_code=400, detail="No parameters provided for scan")
        
    results = await correlator.profile(target_dict)
    return {"status": "success", "results": results}
