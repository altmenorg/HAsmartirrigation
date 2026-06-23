# Smart Irrigation Development Makefile

.PHONY: help setup test lint format clean install-dev

# Default target
help:
	@echo "Smart Irrigation Development Commands:"
	@echo ""
	@echo "Setup:"
	@echo "  setup       - Create virtual environment and install dependencies"
	@echo "  install-dev - Install development dependencies (assumes .venv exists)"
	@echo ""
	@echo "Testing:"
	@echo "  test        - Run all tests"
	@echo ""
	@echo "Code Quality:"
	@echo "  lint        - Run linting (ruff)"
	@echo "  format      - Format code (black)"
	@echo "  check       - Run all CI checks (lint + format)"
	@echo ""
	@echo "Utilities:"
	@echo "  clean       - Remove virtual environment and cache files"

# Setup virtual environment with Python 3.13
setup:
	@echo "Setting up Smart Irrigation development environment..."
	@which python3.13 > /dev/null || (echo "❌ Python 3.13 not found. Install it first." && exit 1)
	python3.13 -m venv .venv
	./.venv/bin/pip install --upgrade pip
	./.venv/bin/pip install -r requirements-dev.txt
	@echo ""
	@echo "✅ Setup complete! Activate with: source .venv/bin/activate"
	@./.venv/bin/python --version

# Install development dependencies (assumes venv exists)
install-dev:
	./.venv/bin/pip install --upgrade pip
	./.venv/bin/pip install -r requirements-dev.txt

# Run all tests (exclude integration tests which have fixtures)
test:
	./.venv/bin/python -m pytest tests/ -v --ignore=tests/integration/

# Code formatting (matches CI requirements)
format: install-dev
	./.venv/bin/black .
	@echo "✅ Code formatted"

# Linting (matches CI requirements)
lint: install-dev
	./.venv/bin/ruff check custom_components/smart_irrigation/
	@echo "✅ Linting complete"

# Clean up
clean:
	rm -rf .venv/
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	@echo "✅ Cleaned up"

# Run all CI quality checks
check: install-dev
	./.venv/bin/ruff check custom_components/smart_irrigation/
	./.venv/bin/black --check .
	@echo "✅ All CI checks passed"
