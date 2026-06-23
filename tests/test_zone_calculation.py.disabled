import pytest
from custom_components.smart_irrigation.core.zone import IrrigationZone

@pytest.fixture
def basic_zone():
    return IrrigationZone(
        name="test",
        size=100.0,
        throughput=10.0,
        state="automatic",
        maximum_bucket=20.0,
        lead_time=30,
        multiplier=1.0,
        drainage_rate=0.0,
        module=MockModule(),
        sensor_group=MockSensorGroup()
    )

class MockModule:
    def calculate_delta(self, weather):
        return -5.0  # simulate evapotranspiration loss

class MockSensorGroup:
    def get_weather(self):
        return {"precipitation": 2.0}

def test_bucket_update_and_duration(basic_zone):
    # Initial bucket at 0
    basic_zone.bucket = 0.0
    basic_zone.update_bucket_and_duration()
    assert basic_zone.bucket == pytest.approx(-3.0)
    assert basic_zone.duration > 0

def test_no_irrigation_when_precip_exceeds_loss(basic_zone):
    basic_zone.bucket = 0.0
    basic_zone.module.calculate_delta = lambda w: -1.0
    basic_zone.sensor_group.get_weather = lambda: {"precipitation": 5.0}
    basic_zone.update_bucket_and_duration()
    assert basic_zone.bucket >= 0
    assert basic_zone.duration == 0
