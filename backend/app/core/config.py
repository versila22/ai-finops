from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_TITLE: str = "AI FinOps"
    DATABASE_URL: str = "sqlite:///./finops.db"
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "https://ai-finops.lovable.app",
        "https://ai-finops-api.duckdns.org",
    ]

    # Provider API keys (read from env / .env file)
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    ELEVENLABS_API_KEY: str = ""

    JWT_SECRET: str = Field(...)
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
