def predict(input_text: str) -> dict:
    return {
        "category": "general",
        "confidence": 0.5,
        "summary": input_text,
    }
