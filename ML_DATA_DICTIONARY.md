# ML Data Dictionary

This document outlines the standard features extracted and engineered from raw weather provider observations within the WeatherOS dataset building pipeline.

## Core Features

| Feature Name | Type | Unit | Source | Meaning |
|---|---|---|---|---|
| `temperature` | Float | °C | Provider | Current actual temperature |
| `temp_change_1h` | Float | °C | Derived | Difference between current temp and 1 hour ago |
| `humidity` | Integer | % | Provider | Relative humidity |
| `pressure` | Integer | hPa | Provider | Atmospheric pressure |
| `wind_speed` | Float | km/h | Provider | Sustained wind speed |
| `is_day` | Boolean (0/1) | None | Derived | Whether the sun is currently up |
| `sin_hour` | Float | None | Engineered | Cyclic encoding of hour of day |
| `cos_hour` | Float | None | Engineered | Cyclic encoding of hour of day |

## Baseline Models
1. **Persistence Baseline**: Predicts that the weather in `t + h` will be identical to weather at `t`.
2. **Provider Baseline**: Directly forwards the external provider API's forecast, acting as the absolute benchmark to beat for any custom ML models.

*Missing values are generally dropped in the validation step before training, as impossible values (e.g. Temp > 60C) are stripped.*
