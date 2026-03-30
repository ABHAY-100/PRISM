import asyncio
import logging
import sys
from typing import Set

_log_queues: Set[asyncio.Queue] = set()


class SSEHandler(logging.Handler):
    def emit(self, record: logging.LogRecord):
        try:
            msg = self.format(record)
            for queue in list(_log_queues):
                try:
                    queue.put_nowait(msg)
                except asyncio.QueueFull:
                    pass
                except Exception:
                    pass
        except Exception:
            self.handleError(record)


def subscribe_to_logs(queue: asyncio.Queue):
    _log_queues.add(queue)


def unsubscribe_from_logs(queue: asyncio.Queue):
    _log_queues.discard(queue)


def setup_logging():
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )
    root_logger = logging.getLogger()

    sse_handler = SSEHandler()
    sse_handler.setFormatter(
        logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    )
    root_logger.addHandler(sse_handler)

    return logging.getLogger(__name__)


logger = setup_logging()
