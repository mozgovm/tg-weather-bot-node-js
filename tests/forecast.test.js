jest.mock('node-fetch', ()=>jest.fn())

const fetch = require('node-fetch');
const fakeResponse = require('./mocks/fakeResponse');
const FORECAST = require('./mocks/forecast');
const { parseForecast, getForecastByCoords, forecastTypes: { now, today, tomorrow } } = require('../forecast');

describe('forecast-functions', () => {
    test('should parse current forecast', () => {
        const EXPECTED_CURRENT_FORECSAST = {
            temp: 9,
            cloudness: 1003,
            wind_speed: 4.2,
            wind_direction: 'WNW',
            pressure: 756,
            humidity: 66,
            isDay: 1
        };

        const current_forecast = parseForecast(FORECAST, now);

        expect(current_forecast).toEqual(EXPECTED_CURRENT_FORECSAST);
    });

    test('should parse todays forecast', () => {
        const EXPECTED_TODAYS_FORECAST = {
            temp: 10,
            cloudness: 1063,
            wind_speed: 4.8,
            humidity: 71,
            date: '19.05.2020'
        };

        const todays_forecast = parseForecast(FORECAST, today);

        expect(todays_forecast).toEqual(EXPECTED_TODAYS_FORECAST);
    });

    test('should get tomorrow forecast by coords', async () => {
        const EXPECTED_TOMORROWS_FORECAST = {
            temp: 12,
            cloudness: 1192,
            wind_speed: 4.8,
            humidity: 62,
            date: '20.05.2020'
        };
        
        fetch.mockImplementation(()=> fakeResponse(FORECAST));

        const forecastByCoords = await getForecastByCoords(59.959, 30.406, tomorrow);

        expect(forecastByCoords).toEqual(EXPECTED_TOMORROWS_FORECAST);
        
    });
});
