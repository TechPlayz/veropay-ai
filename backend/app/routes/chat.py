from fastapi import APIRouter, HTTPException

from app.database import get_db
from app.schemas import ChatRequest, ChatResponse
from app.services.ai_service import AIConfigurationError, AIProviderError, generate_chat_response

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest):
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT platform, offered_fare, expected_fare, fairness_score, recommendation "
            "FROM rides ORDER BY created_at DESC LIMIT 5"
        ).fetchall()
    finally:
        conn.close()

    if rows:
        ride_context = "\n".join(
            f"{r['platform']}: offered Rs. {r['offered_fare']:.2f}, "
            f"expected Rs. {r['expected_fare']:.2f}, "
            f"fairness {r['fairness_score']:.0f}%, recommendation {r['recommendation']}."
            for r in rows
        )
    else:
        ride_context = "No rides have been analysed yet."

    try:
        answer = generate_chat_response(
            messages=[m.model_dump() for m in payload.messages],
            ride_context=ride_context,
            use_web_search=payload.use_web_search,
        )
    except AIConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except AIProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return ChatResponse(response=answer)
