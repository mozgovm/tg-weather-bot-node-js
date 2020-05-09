const { weatherAPIToken } = require('./config/tokens');
const { getCoordsByLocationName } = require('./geolocation');
const fetch = require('node-fetch');

const forecastTypes = {
    now: 'сейчас',
    today: 'сегодня',
    tomorrow: 'завтра'
};

class currentForecastShort {
    constructor(route) {
        this.temp = Math.round(route.temp_c);
        this.cloudness = route.condition.code;
        this.wind_speed = parseFloat((route.wind_kph / 3.6).toFixed(1));
        this.wind_direction = route.wind_dir;
        this.pressure = Math.floor(route.pressure_mb * 0.750063755419211);
        this.humidity = route.humidity;
        this.isDay = route.is_day;
    }
};

class forecastShort {
    constructor(route) {
        this.temp = Math.round(route.day.maxtemp_c);
        this.cloudness = route.day.condition.code;
        this.wind_speed = parseFloat((route.day.maxwind_kph / 3.6).toFixed(1));
        this.humidity = route.day.avghumidity;
        this.date = route.date.split('-').reverse().join('.')
    }
};

function LocationSearchException(locationName) {
    this.message = `По запросу \"${locationName}\" не найдено ни одной локации`;
    this.code = 'NOLOC';
};

async function getForecastByCoords (lat, lon, forecastType) {
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${weatherAPIToken}&q=${lat},${lon}&days=2`;
    const res = await fetch(url);
    const forecast = await res.json();
    return parseForecast(forecast, forecastType);
};

async function getForecastByLocationName (locationName) {
    [ lon, lat ] = await getCoordsByLocationName(locationName).catch(e => console.error(e));
    return getForecastByCoords (lat, lon);
};

function parseForecast(forecast, forecastType) {
    let route;
    switch (forecastType) {
        case forecastTypes.now:
            route = forecast.current;
            return new currentForecastShort(route);
        case forecastTypes.today:
            route = forecast.forecast.forecastday[0];
            return new forecastShort(route);
        case forecastTypes.tomorrow:
            route = forecast.forecast.forecastday[1];
            return new forecastShort(route);
        default:
            console.error(`Нет прогноза для запроса \"${forecastType}\"`);
            return;
    };
};

module.exports = {
    getForecastByCoords: getForecastByCoords,
    getForecastByLocationName: getForecastByLocationName,
    parseForecast: parseForecast,
    forecastTypes: forecastTypes
};

