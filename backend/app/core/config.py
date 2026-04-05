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

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
