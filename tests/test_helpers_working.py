"""Working tests for Smart Irrigation helper functions."""

from custom_components.smart_irrigation.helpers import (
    CannotConnect,
    InvalidAuth,
    check_time,
)


class TestHelperExceptions:
    """Test custom exception classes."""

    def test_cannot_connect_exception(self):
        """Test CannotConnect exception."""
        exc = CannotConnect("Connection failed")
        assert str(exc) == "Connection failed"
        assert isinstance(exc, Exception)

    def test_invalid_auth_exception(self):
        """Test InvalidAuth exception."""
        exc = InvalidAuth("Authentication failed")
        assert str(exc) == "Authentication failed"
        assert isinstance(exc, Exception)

    def test_exception_inheritance(self):
        """Test that exceptions inherit from proper base classes."""
        assert issubclass(CannotConnect, Exception)
        assert issubclass(InvalidAuth, Exception)

    def test_exception_with_empty_message(self):
        """Test exceptions with empty messages."""
        exc1 = CannotConnect("")
        exc2 = InvalidAuth("")
        assert str(exc1) == ""
        assert str(exc2) == ""


class TestTimeFunctions:
    """Test time-related helper functions."""

    def test_check_time_valid_format(self):
        """Test time validation with valid formats."""
        assert check_time("12:30") is True
        assert check_time("00:00") is True
        assert check_time("23:59") is True
        assert check_time("01:01") is True
        assert check_time("6:30") is True

    def test_check_time_invalid_format(self):
        """Test time validation with invalid formats."""
        assert check_time("25:00") is False
        assert check_time("12:60") is False
        assert check_time("invalid") is False
        assert check_time("") is False
        assert check_time("12") is False
        assert check_time(":30") is False

    def test_check_time_edge_cases(self):
        """Test time validation edge cases."""
        assert check_time("24:00") is False
        assert check_time("-1:30") is False
        assert check_time("12:30:45") is False  # Too many parts
        assert check_time("12:") is False
        assert check_time(":12") is False

    def test_check_time_boundary_values(self):
        """Test time validation at boundaries."""
        # Valid boundaries
        assert check_time("00:00") is True
        assert check_time("23:59") is True

        # Invalid boundaries
        assert check_time("24:00") is False
        assert check_time("00:60") is False
        assert check_time("23:60") is False

    def test_check_time_type_safety(self):
        """Test time validation with different types."""
        # Non-string inputs should be handled gracefully
        assert check_time(None) is False
        assert check_time(1230) is False
        assert check_time([12, 30]) is False
        assert check_time({"hour": 12, "minute": 30}) is False


class TestPerformanceOptimizations:
    """Test performance-related aspects of helper functions."""

    def test_time_validation_performance(self):
        """Test time validation performance."""
        import time

        start_time = time.time()
        for _ in range(1000):
            check_time("12:30")
        end_time = time.time()

        assert (end_time - start_time) < 1.0

    def test_exception_creation_performance(self):
        """Test exception creation performance."""
        import time

        start_time = time.time()
        for _ in range(1000):
            try:
                raise CannotConnect("Test error")
            except CannotConnect:
                pass
        end_time = time.time()

        assert (end_time - start_time) < 1.0


class TestRobustness:
    """Test robustness and error handling."""

    def test_unicode_strings(self):
        """Test functions with unicode strings."""
        result = check_time("1２:30")
        assert isinstance(result, bool)
        assert check_time("ｈello") is False

    def test_whitespace_handling(self):
        """Test handling of whitespace in inputs."""
        result = check_time(" 12:30 ")
        assert isinstance(result, bool)

        assert check_time("") is False
        assert check_time("   ") is False

    def test_very_long_strings(self):
        """Test with very long input strings."""
        long_string = "a" * 1000
        assert check_time(long_string) is False


class TestMultithreading:
    """Test thread safety of helper functions."""

    def test_concurrent_time_validation(self):
        """Test time validation under concurrent access."""
        import threading
        import time

        results = []
        errors = []

        def validate_time():
            try:
                for _ in range(100):
                    result = check_time("12:30")
                    results.append(result)
            except Exception as e:
                errors.append(e)

        threads = [threading.Thread(target=validate_time) for _ in range(10)]

        start_time = time.time()
        for thread in threads:
            thread.start()

        for thread in threads:
            thread.join()
        end_time = time.time()

        assert len(errors) == 0
        assert len(results) == 1000
        assert all(result is True for result in results)
        assert (end_time - start_time) < 5.0  # Should complete quickly


class TestErrorMessages:
    """Test error message clarity and consistency."""

    def test_exception_message_clarity(self):
        """Test that exception messages are clear."""
        detailed_message = (
            "Unable to connect to weather service API at https://api.example.com"
        )
        exc = CannotConnect(detailed_message)
        assert detailed_message in str(exc)

    def test_exception_message_consistency(self):
        """Test exception message consistency."""
        messages = [
            "Connection timeout",
            "Network unreachable",
            "DNS resolution failed",
        ]

        for message in messages:
            exc = CannotConnect(message)
            assert str(exc) == message

            exc = InvalidAuth(message)
            assert str(exc) == message
