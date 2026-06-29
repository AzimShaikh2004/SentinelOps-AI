/**
 * Double Exponential Smoothing (Holt's Linear Trend) Forecaster
 * Projects trend lines into the future based on historical patterns.
 *
 * @param {number[]} data Historical values
 * @param {number} steps Number of steps into the future to predict
 * @param {number} alpha Smoothing factor for level (0 to 1)
 * @param {number} beta Smoothing factor for trend (0 to 1)
 * @returns {number[]} Array of forecasted future values
 */
const forecastSeries = (data, steps = 5, alpha = 0.3, beta = 0.1) => {
  if (!data || data.length === 0) {
    return Array(steps).fill(0);
  }
  if (data.length < 3) {
    return Array(steps).fill(data[data.length - 1] || 0);
  }

  // Initialize level and trend
  let level = data[0];
  let trend = data[1] - data[0];

  for (let i = 1; i < data.length; i++) {
    const lastLevel = level;
    // Holt's Level equation
    level = alpha * data[i] + (1 - alpha) * (level + trend);
    // Holt's Trend equation
    trend = beta * (level - lastLevel) + (1 - beta) * trend;
  }

  // Extrapolate m steps forward
  const forecast = [];
  for (let m = 1; m <= steps; m++) {
    let val = level + m * trend;
    // Constrain values within logical boundaries (0% to 100%)
    val = Math.max(0, Math.min(100, val));
    forecast.push(parseFloat(val.toFixed(1)));
  }

  return forecast;
};

module.exports = {
  forecastSeries,
};
