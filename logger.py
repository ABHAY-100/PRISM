import asyncio
import logging
from datetime import datetime
from typing import Set
from fastapi import WebSocket


class WebSocketLogHandler(logging.Handler):
    def __init__(self):
        super().__init__()
        self._clients: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def add_client(self, websocket: WebSocket):
        async with self._lock:
            self._clients.add(websocket)
        await self._send_history(websocket)

    async def remove_client(self, websocket: WebSocket):
        async with self._lock:
            self._clients.discard(websocket)

    async def _send_history(self, websocket: WebSocket):
        await websocket.send_json(
            {
                "timestamp": datetime.utcnow().isoformat(),
                "level": "INFO",
                "logger": "websocket",
                "message": "Connected to PRISM log stream",
            }
        )

    def emit(self, record: logging.LogRecord):
        if not self._clients:
            return

        log_entry = {
            "timestamp": datetime.fromtimestamp(record.created).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": self.format(record),
        }

        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.create_task(self._broadcast(log_entry))
        except RuntimeError:
            pass

    async def _broadcast(self, log_entry: dict):
        disconnected = []

        async with self._lock:
            clients = list(self._clients)

        for client in clients:
            try:
                await client.send_json(log_entry)
            except Exception:
                disconnected.append(client)

        if disconnected:
            async with self._lock:
                for client in disconnected:
                    self._clients.discard(client)


websocket_handler = WebSocketLogHandler()
websocket_handler.setFormatter(logging.Formatter("%(message)s"))


def setup_websocket_logging():
    root_logger = logging.getLogger()
    root_logger.addHandler(websocket_handler)
    return websocket_handler


async def handle_websocket(websocket: WebSocket):
    await websocket.accept()
    await websocket_handler.add_client(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except Exception:
        pass
    finally:
        await websocket_handler.remove_client(websocket)
