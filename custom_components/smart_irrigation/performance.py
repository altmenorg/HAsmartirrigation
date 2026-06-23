"""Performance monitoring utilities for Smart Irrigation."""

import inspect
import logging
import time
from collections.abc import Callable
from functools import wraps
from typing import Any

_LOGGER = logging.getLogger(__name__)


def performance_timer(func_name: str | None = None):
    """Time functions (both sync and async) and log if they take too long."""

    def decorator(func: Callable) -> Callable:
        name = func_name or f"{func.__module__}.{func.__name__}"

        if inspect.iscoroutinefunction(func):
            # Async function
            @wraps(func)
            async def async_wrapper(*args, **kwargs) -> Any:
                start_time = time.perf_counter()
                try:
                    return await func(*args, **kwargs)
                finally:
                    end_time = time.perf_counter()
                    duration = end_time - start_time
                    _log_duration(name, duration)

            return async_wrapper

        # Sync function
        @wraps(func)
        def sync_wrapper(*args, **kwargs) -> Any:
            start_time = time.perf_counter()
            try:
                return func(*args, **kwargs)
            finally:
                end_time = time.perf_counter()
                duration = end_time - start_time
                _log_duration(name, duration)

        return sync_wrapper

    return decorator


def _log_duration(name: str, duration: float) -> None:
    """Log duration based on thresholds."""
    if duration > 0.1:  # Log if function takes more than 100ms
        _LOGGER.warning(
            "Function %s took %.3f seconds (threshold: 0.1s)",
            name,
            duration,
        )
    elif duration > 0.05:  # Debug log for 50ms+
        _LOGGER.debug("Function %s took %.3f seconds", name, duration)


# Keep the old name for backward compatibility
async_timer = performance_timer


class AsyncPerformanceMonitor:
    """Monitor performance of async operations."""

    def __init__(self, name: str, threshold: float = 0.1) -> None:
        """Initialize the performance monitor.

        Args:
            name: Name for logging
            threshold: Time threshold in seconds for warnings

        """
        self.name = name
        self.threshold = threshold
        self.start_time = None

    async def __aenter__(self):
        """Start timing."""
        self.start_time = time.perf_counter()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """End timing and log if necessary."""
        if self.start_time is not None:
            duration = time.perf_counter() - self.start_time

            if duration > self.threshold:
                _LOGGER.warning(
                    "Operation %s took %.3f seconds (threshold: %.3fs)",
                    self.name,
                    duration,
                    self.threshold,
                )
            elif duration > self.threshold / 2:
                _LOGGER.debug("Operation %s took %.3f seconds", self.name, duration)
