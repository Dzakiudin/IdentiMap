from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "IdentiMap OSINT Engine"
    VERSION: str = "1.0.0"
    
    # Add API keys here eventually
    # GOOGLE_API_KEY: str = ""
    # GOOGLE_CX: str = ""

settings = Settings()
