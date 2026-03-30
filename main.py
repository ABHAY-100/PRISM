from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import os
import asyncio
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

from logger import logger, subscribe_to_logs, unsubscribe_from_logs

load_dotenv()

from core.agent import process_discord_message

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MessageRequest(BaseModel):
    user_id: str
    message_content: str
    conversation_id: Optional[str] = None


class MessageResponse(BaseModel):
    response: str


@app.get("/logs/stream")
async def stream_logs():
    queue = asyncio.Queue()
    subscribe_to_logs(queue)

    async def event_generator():
        try:
            while True:
                msg = await queue.get()
                yield f"data: {msg}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            unsubscribe_from_logs(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@app.get("/")
def main():
    logger.debug("Health check requested")
    return {"status": "ok"}


@app.post("/chat", response_model=MessageResponse)
async def chat(request: MessageRequest):
    user_id = request.user_id
    message_content = request.message_content

    logger.info(
        f"Chat request from user_id={user_id}, content_length={len(message_content) if message_content else 0}"
    )

    try:
        response = process_discord_message(
            user_id=user_id,
            message_content=message_content,
        )

        logger.info(
            f"Chat response generated for user_id={user_id}, response_length={len(response)}"
        )
        return MessageResponse(response=response)

    except Exception as e:
        logger.error(f"Error processing chat for user_id={user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error processing message: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
