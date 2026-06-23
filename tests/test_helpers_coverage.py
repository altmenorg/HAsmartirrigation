"""Test Smart Irrigation helper functions to improve coverage."""

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

    def test_exception_with_long_message(self):
        """Test exceptions with long messages."""
        long_message = "This is a very long error message " * 10
        exc = CannotConnect(long_message)
        assert str(exc) == long_message

    def test_exception_with_special_characters(self):
        """Test exceptions with special characters."""
        special_message = "Error: ñoñö spëcíål ♠♣♥♦"
        exc = InvalidAuth(special_message)
        assert str(exc) == special_message


class TestTimeFunctions:
    """Test time-related helper functions."""

    def test_check_time_valid_format(self):
        """Test time validation with valid formats."""
        assert check_time("12:30") is True
        assert check_time("00:00") is True
        assert check_time("23:59") is True
        assert check_time("01:01") is True
        assert check_time("6:30") is True
        assert check_time("06:30") is True

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

    def test_check_time_current_behavior_whitespace(self):
        """Test current behavior with whitespace (documenting as-is)."""
        # Currently the function accepts whitespace in many cases
        assert check_time(" 12:30 ") is True  # Current behavior
        assert check_time("12 :30") is True  # Space is actually accepted
        assert check_time("12: 30") is True  # Space after colon also accepted

    def test_check_time_type_safety_string_only(self):
        """Test time validation requires string input."""
        # Only test with strings since function expects strings
        assert check_time("1230") is False  # No colon
        assert check_time("12.30") is False  # Wrong separator

    def test_check_time_with_unicode_content(self):
        """Test time validation with actual behavior for unicode."""
        # Test with regular unicode that might actually be used
        assert check_time("2２:30") is True  # Mixed unicode/ascii actually works
        assert check_time("ｈello") is False  # Full unicode


class TestPerformanceOptimizations:
    """Test performance-related aspects of helper functions."""

    def test_time_validation_performance(self):
        """Test time validation performance."""
        import time

        start_time = time.time()
        for _ in range(1000):
            check_time("12:30")
        end_time = time.time()

        # Should complete 1000 validations in well under a second
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

        # Should complete 1000 exception creations quickly
        assert (end_time - start_time) < 1.0


class TestRobustness:
    """Test robustness and error handling."""

    def test_very_long_strings(self):
        """Test with very long input strings."""
        long_string = "a" * 1000
        assert check_time(long_string) is False

    def test_time_validation_with_numeric_strings(self):
        """Test time validation with various numeric string formats."""
        assert check_time("01:01") is True
        assert check_time("1:1") is True
        assert check_time("00:01") is True
        assert check_time("1:01") is True

    def test_time_validation_comprehensive(self):
        """Comprehensive time validation test."""
        valid_times = [
            "00:00",
            "00:01",
            "00:59",
            "01:00",
            "01:30",
            "01:59",
            "12:00",
            "12:30",
            "12:59",
            "23:00",
            "23:30",
            "23:59",
        ]

        for time_str in valid_times:
            assert check_time(time_str) is True, f"Time {time_str} should be valid"

        invalid_times = [
            "24:00",
            "25:00",
            "99:99",
            "00:60",
            "00:99",
            "12:60",
            "-1:30",
            "12:-1",
            "-1:-1",
            "ab:cd",
            "12:ab",
            "ab:30",
        ]

        for time_str in invalid_times:
            assert check_time(time_str) is False, f"Time {time_str} should be invalid"


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

    def test_exception_repr(self):
        """Test exception repr for debugging."""
        exc = CannotConnect("Test message")
        repr_str = repr(exc)
        assert "CannotConnect" in repr_str
        assert "Test message" in repr_str


class TestDocumentedBehavior:
    """Test and document current behavior for future improvements."""

    def test_time_function_error_cases(self):
        """Document error cases that could be improved."""
        # These tests document current behavior that might be improved later

        # Function now handles None gracefully (bug fixed)
        assert check_time(None) is False

        # Function now handles non-string types gracefully (bug fixed)
        assert check_time(1230) is False

        # Function now handles list types gracefully (bug fixed)
        assert check_time([12, 30]) is False

    def test_time_function_whitespace_handling(self):
        """Document current whitespace handling."""
        # Currently strips leading/trailing whitespace
        assert check_time("  12:30  ") is True
        assert check_time("\t12:30\t") is True
        assert check_time("\n12:30\n") is True


class TestCoverageBooster:
    """Additional tests to boost code coverage."""

    def test_boundary_hour_values(self):
        """Test hour boundary values systematically."""
        # Test each hour boundary
        for hour in range(24):
            time_str = f"{hour:02d}:00"
            assert check_time(time_str) is True

        # Test invalid hours
        for hour in [24, 25, -1, 99]:
            time_str = f"{hour:02d}:00" if hour >= 0 else f"{hour}:00"
            assert check_time(time_str) is False

    def test_boundary_minute_values(self):
        """Test minute boundary values systematically."""
        # Test each minute boundary
        for minute in range(60):
            time_str = f"12:{minute:02d}"
            assert check_time(time_str) is True

        # Test invalid minutes
        for minute in [60, 61, -1, 99]:
            time_str = f"12:{minute:02d}" if minute >= 0 else f"12:{minute}"
            assert check_time(time_str) is False

    def test_string_edge_cases(self):
        """Test string parsing edge cases."""
        # Empty parts
        assert check_time(":") is False
        assert check_time("::") is False

        # Too many colons
        assert check_time("12:30:45") is False
        assert check_time("12:30:45:60") is False

        # Non-numeric content
        assert check_time("ab:cd") is False
        assert check_time("12:cd") is False
        assert check_time("ab:30") is False
