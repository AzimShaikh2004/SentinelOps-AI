const { describe, test } = require("node:test");
const assert = require("node:assert");
const { forecastSeries } = require("../src/utils/forecaster");

describe("Forecaster — Holt's Double Exponential Smoothing", () => {
  test("TC-11: Should return array of 5 forecasted values for valid input", () => {
    const data = [40, 42, 45, 47, 50, 52, 55];
    const forecast = forecastSeries(data, 5);

    assert.strictEqual(forecast.length, 5);
    forecast.forEach((val) => {
      assert.strictEqual(typeof val, "number");
      assert.ok(val >= 0, `Value ${val} should be >= 0`);
      assert.ok(val <= 100, `Value ${val} should be <= 100`);
    });
  });

  test("Should return zeros for empty input", () => {
    const forecast = forecastSeries([], 5);
    assert.deepStrictEqual(forecast, [0, 0, 0, 0, 0]);
  });

  test("Should return last value for inputs with fewer than 3 data points", () => {
    const forecast = forecastSeries([50, 60], 3);
    assert.deepStrictEqual(forecast, [60, 60, 60]);
  });

  test("Should detect upward trend and forecast increasing values", () => {
    const data = [20, 25, 30, 35, 40, 45, 50];
    const forecast = forecastSeries(data, 3);

    for (let i = 1; i < forecast.length; i++) {
      assert.ok(forecast[i] >= forecast[i - 1], `Step ${i} should be >= step ${i-1}`);
    }
    assert.ok(forecast[0] >= 50, "First forecast step should project above recent value");
  });

  test("Should clamp forecasts within logical boundary [0, 100]", () => {
    const data = [80, 85, 90, 95, 98, 99];
    const forecast = forecastSeries(data, 5);

    forecast.forEach((val) => {
      assert.ok(val <= 100, `Value ${val} should be <= 100`);
      assert.ok(val >= 0, `Value ${val} should be >= 0`);
    });
  });

  test("Should handle null/undefined input gracefully", () => {
    const forecast = forecastSeries(null, 5);
    assert.deepStrictEqual(forecast, [0, 0, 0, 0, 0]);
  });

  test("Should return requested number of forecast steps", () => {
    const data = [30, 32, 34, 36, 38];
    assert.strictEqual(forecastSeries(data, 3).length, 3);
    assert.strictEqual(forecastSeries(data, 7).length, 7);
    assert.strictEqual(forecastSeries(data, 1).length, 1);
  });
});

