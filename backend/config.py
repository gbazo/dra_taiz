import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Parse Server Configuration
    PARSE_APP_ID = os.getenv("PARSE_APP_ID")
    PARSE_JAVASCRIPT_KEY = os.getenv("PARSE_JAVASCRIPT_KEY")
    PARSE_MASTER_KEY = os.getenv("PARSE_MASTER_KEY")
    PARSE_REST_API_KEY = os.getenv("PARSE_REST_API_KEY")
    PARSE_FILE_KEY = os.getenv("PARSE_FILE_KEY")
    PARSE_SERVER_URL = os.getenv("PARSE_SERVER_URL", "https://parseapi.back4app.com")
    
    # JWT Configuration
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # API Headers for Parse
    PARSE_HEADERS = {
        "X-Parse-Application-Id": PARSE_APP_ID,
        "X-Parse-REST-API-Key": PARSE_REST_API_KEY,
        "Content-Type": "application/json"
    }

settings = Settings()