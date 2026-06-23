import pytest
from custom_components.smart_irrigation.core.zone import IrrigationZone

class DummyModule:
    def calculate_delta(self, weather):
        return -5.0

class DummySensors:
    def get_weather(self):
        return {"precipitation": 0.0}

@pytest.fixture
def zone():
    return IrrigationZone(
        name="edge",
        size=50.0,
        throughput=5.0,
        state="automatic",
        maximum_bucket=10.0,
        lead_time=10,
        multiplier=2.0,
        drainage_rate=1.0,
        module=DummyModule(),
        sensor_group=DummySensors(),
    )

def test_max_bucket_limit(zone):
    zone.bucket = zone.maximum_bucket + 5
    zone.update_bucket_and_duration()
    # Bucket should be clamped to maximum_bucket
    assert zone.bucket <= zone.maximum_bucket

def test_multiplier_and_lead_time(zone):
    zone.bucket = -10.0
    zone.update_bucket_and_duration()
    assert zone.duration > zone.lead_time
    # Duration without multiplier ≈ bucket/throughput; with multiplier > that:
    base = abs(-10.0) / zone.throughput
    assert zone.duration >= base * zone.multiplier + zone.lead_time

def test_drainage_does_not_apply_when_bucket_negative(zone):
    zone.bucket = -2.0
    pre = zone.bucket
    zone.update_bucket_and_duration()
    assert zone.bucket <= pre
