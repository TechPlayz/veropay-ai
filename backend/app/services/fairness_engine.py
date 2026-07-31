from dataclasses import dataclass

HOURLY_EARNING_EXPECTATION = 180.0
BASE_FARE = 20.0

TRAFFIC_ADJUSTMENTS = {"Low": 0.00, "Medium": 0.05, "High": 0.10, "Very High": 0.20}
WEATHER_ADJUSTMENTS = {"Sunny": 0.00, "Rain": 0.10, "Storm": 0.20, "Extreme Heat": 0.05}
PLATFORM_ADJUSTMENTS = {"Uber": 0.05, "Rapido": 0.03, "Swiggy": 0.02, "Zomato": 0.02, "Blinkit": 0.03, "Porter": 0.05}


@dataclass(frozen=True)
class FairnessResult:
    fuel_cost: float
    maintenance_cost: float
    time_cost: float
    expected_fare: float
    net_profit: float
    fairness_score: float
    recommendation: str
    ai_explanation: str


def calculate_fairness(*, offered_fare: float, distance_km: float, duration_minutes: int, mileage: float, maintenance_cost_per_km: float, fuel_price: float, traffic_level: str, weather: str, platform: str) -> FairnessResult:
    if traffic_level not in TRAFFIC_ADJUSTMENTS:
        raise ValueError(f"Unsupported traffic level: {traffic_level}")
    if weather not in WEATHER_ADJUSTMENTS:
        raise ValueError(f"Unsupported weather: {weather}")

    fuel_cost = (distance_km / mileage) * fuel_price
    maintenance_cost = distance_km * maintenance_cost_per_km
    time_cost = (duration_minutes / 60) * HOURLY_EARNING_EXPECTATION
    operating_cost = fuel_cost + maintenance_cost + time_cost
    traffic_cost = operating_cost * TRAFFIC_ADJUSTMENTS[traffic_level]
    weather_cost = operating_cost * WEATHER_ADJUSTMENTS[weather]
    platform_cost = operating_cost * PLATFORM_ADJUSTMENTS.get(platform, 0.0)
    expected_fare = BASE_FARE + operating_cost + traffic_cost + weather_cost + platform_cost
    fairness_score = max(0.0, min((offered_fare / expected_fare) * 100, 100.0))
    net_profit = offered_fare - fuel_cost - maintenance_cost

    if fairness_score > 90:
        recommendation = "Accept"
    elif fairness_score >= 80:
        recommendation = "Good Ride"
    elif fairness_score >= 70:
        recommendation = "Think Before Accepting"
    else:
        recommendation = "Reject"

    explanation = (
        f"The offered fare is Rs. {offered_fare:.2f} compared with an estimated fair fare of Rs. {expected_fare:.2f}. "
        f"Fuel, maintenance, travel time, {traffic_level.lower()} traffic, and {weather.lower()} weather were included. "
        f"The estimated operating profit is Rs. {net_profit:.2f}, so VeroPay recommends: {recommendation}."
    )
    return FairnessResult(
        fuel_cost=round(fuel_cost, 2), maintenance_cost=round(maintenance_cost, 2),
        time_cost=round(time_cost, 2), expected_fare=round(expected_fare, 2),
        net_profit=round(net_profit, 2), fairness_score=round(fairness_score, 2),
        recommendation=recommendation, ai_explanation=explanation,
    )
