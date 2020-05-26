const { weatherAPIToken } = require('./config/tokens');
const { getCoordsByLocationName } = require('./geolocation');
const fetch = require('node-fetch');

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
}

class forecastShort {
    constructor(route) {
        this.temp = Math.round(route.day.maxtemp_c);
        this.cloudness = route.day.condition.code;
        this.wind_speed = parseFloat((route.day.maxwind_kph / 3.6).toFixed(1));
        this.humidity = route.day.avghumidity;
        this.date = route.date.split('-').reverse().join('.')
    }
}

module.exports = {
    forecastTypes: {
        now: 'сейчас',
        today: 'сегодня',
        tomorrow: 'завтра'
    },

    parseForecast: (forecast, forecastType) => {
        let route;
        switch (forecastType) {
            case module.exports.forecastTypes.now:
                route = forecast.current;
                return new currentForecastShort(route);
            case module.exports.forecastTypes.today:
                route = forecast.forecast.forecastday[0];
                return new forecastShort(route);
            case module.exports.forecastTypes.tomorrow:
                route = forecast.forecast.forecastday[1];
                return new forecastShort(route);
        }
    },

    getForecastByCoords: async (lat, lon, forecastType) => {
        const url = `http://api.weatherapi.com/v1/forecast.json?key=${weatherAPIToken}&q=${lat},${lon}&days=2`;
        const res = await fetch(url);
        const forecast = await res.json();
        return module.exports.parseForecast(forecast, forecastType);
    },

    getForecastByLocationName: async (locationName) => {
        [ lon, lat ] = await getCoordsByLocationName(locationName).catch(e => console.error(e));
        return module.exports.getForecastByCoords (lat, lon);
    }
};
