from custom_components.smart_irrigation.core.updater import ContinuousUpdater

def test_riemann_sum_aggregate():
    # Sample hourly delta readings
    deltas = [-1.0, -1.5, -2.0, -1.5]
    updater = ContinuousUpdater()
    total = updater.aggregate(deltas)
    assert total == pytest.approx(sum(deltas))
