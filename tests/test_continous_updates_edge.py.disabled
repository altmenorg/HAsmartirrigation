import pytest
from custom_components.smart_irrigation.core.updater import ContinuousUpdater

def test_empty_aggregate():
    updater = ContinuousUpdater()
    assert updater.aggregate([]) == 0

def test_aggregate_positive_and_negative():
    data = [1.0, -2.0, 3.5]
    assert updater.aggregate(data) == pytest.approx(2.5)
