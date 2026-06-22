[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=flat-square)](https://github.com/hacs/integration)
[![release][release-badge]][release-url]

[release-url]: https://github.com/altmenorg/HappyIrrigation/releases
[release-badge]: https://img.shields.io/github/v/release/altmenorg/HappyIrrigation?style=flat-square

# Happy Irrigation

![](logo.png?raw=true)

> **Happy Irrigation** is a community-maintained fork of
> [Smart Irrigation](https://github.com/jeroenterheerdt/HAsmartirrigation) by
> [Jeroen ter Heerdt](https://github.com/jeroenterheerdt) — all credit for the
> original integration goes to him. This fork keeps it actively maintained,
> with bug fixes (e.g. the editing scroll-jump,
> [#708](https://github.com/jeroenterheerdt/HAsmartirrigation/issues/708)) and a
> modernized, HA-native configuration UI. It uses the same `smart_irrigation`
> domain, so it is a drop-in replacement (your existing configuration is kept).

```diff
- WARNING: upgrading from V1 (V0.0.X) to V2 (V2023.X.X)? Read the instructions below!
```

| :warning: WARNING Are you upgrading from v0.0.X (aka V1) to V2023.X.X (aka V2)? |
|:---------------------------|
| Stop what you're doing and [capture your V1 configuration](https://jeroenterheerdt.github.io/HAsmartirrigation/installation-migration.html) _before_ installing V2. V2 is a complete overhaul of this integration and there is no upgrade path. This means that effectively you will have to start over. See the [docs](https://jeroenterheerdt.github.io/HAsmartirrigation/installation-migration.html) for instructions. We will not be able to recover your V1 configuration if you don't capture it before installing V2. |

This integration calculates the time to run your irrigation system to compensate for moisture loss by [evapotranspiration](https://en.wikipedia.org/wiki/Evapotranspiration). Using this integration you water your garden, lawn or crops precisely enough to compensate what has evaporated. It takes into account precipitation (rain, snow) and moisture loss caused by evapotranspiration and adjusts accordingly.
If it rains or snows less than the amount of moisture lost, then irrigation is required. Otherwise, no irrigation is required.
The integration can take into account weather forecasts for the coming days and also keeps track of the total moisture lost or added ('bucket')
Multiple zones are supported with each zone having it own configuration and set up.

## Enhanced Features

Smart Irrigation now includes enhanced scheduling capabilities and Irrigation Unlimited integration:

- **Recurring Schedules**: Create flexible daily, weekly, monthly, or interval-based irrigation schedules
- **Seasonal Adjustments**: Automatically adjust irrigation parameters based on the season
- **Irrigation Unlimited Integration**: Seamless bidirectional integration with the Irrigation Unlimited component
- **Weather-Responsive Scheduling**: Advanced scheduling that adapts to weather conditions and forecasts
- **Automation Blueprints**: Ready-to-use blueprints for common irrigation scenarios

See the [enhanced scheduling documentation](docs/enhanced-scheduling-integration.md) for detailed information and examples.

## Development

For contributors and developers:

### Quick Setup

```bash
# Clone and setup development environment
git clone <repository-url>
cd HAsmartirrigation
make setup
```

### Available Commands

```bash
make help        # Show all available commands
make test        # Run all tests
make format      # Format code
make lint        # Run linting
```

### Testing

To run the tests for this Smart Irrigation custom component:

#### Prerequisites

1. Install test requirements:
   ```bash
   pip install -r requirements.test.txt
   ```

#### Running Tests

Run all tests:
```bash
pytest
```

Run specific test directories:
```bash
# Tests in the main tests/ directory
pytest tests/

# Tests in the custom component
pytest custom_components/smart_irrigation/tests/
```

Run specific test files:
```bash
pytest tests/test_services.py
pytest custom_components/smart_irrigation/tests/test_init.py
```

#### Test Structure

The project has two test directories:
- `tests/` - Integration tests and component behavior tests
- `custom_components/smart_irrigation/tests/` - Unit tests for the custom component

#### Troubleshooting Tests

If you encounter issues:

1. **Missing Home Assistant objects**: The test infrastructure includes mocks for Home Assistant core objects like `hass.config` and `hass.data`. If you get AttributeErrors, ensure the fixtures are properly imported.

2. **Import errors**: Make sure you're running tests from the repository root directory. The test configuration automatically adds the necessary paths.

3. **Module not found errors**: Ensure all test dependencies are installed:
   ```bash
   pip install -r requirements.test.txt
   ```

4. **Async/await issues**: Tests use pytest-asyncio. Make sure async test functions are properly marked and fixtures are compatible.

#### Known Test Limitations

Some test files reference modules that don't exist in the current codebase (e.g., `core.zone`, `core.updater`). These have been disabled with `.disabled` extensions until the corresponding functionality is implemented or the tests are updated.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development instructions.

## Read the docs: https://jeroenterheerdt.github.io/HAsmartirrigation/
