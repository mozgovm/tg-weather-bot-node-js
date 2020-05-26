const cloudnessCodes = require('./config/weather_confs/cloudness-codes');
const { north, south, west, east, north_west, north_east, south_west, south_east } = require('./config/weather_confs/wind-directions');
const { forecastTypes: { now } } = require('./forecast');

module.exports = {
    getDayPart: (isDay) => {
        return (isDay === 1) ? "day" : "night"
    },

    getCloudness: (code, lang, dayPart) => {
        return cloudnessCodes[code][lang][`${dayPart}_text`];
    },

    renderCloudness: (forecast) => {
        return `<b>${module.exports.getCloudness(forecast.cloudness, 'Russian', module.exports.getDayPart(forecast.isDay))}</b>`;
    },

    renderPlus: (temp) => {
        return (temp > 0) ? "+" : "";
    },

    getWindDirection: (windDir) => {
        switch (windDir) {
            case "N":
                return `${north.point} ${north.arrow}`;
            case "S":
                return `${south.point} ${south.arrow}`;
            case "W":
                return `${west.point} ${west.arrow}`;
            case "E":
                return `${east.point} ${east.arrow}`;
            case "NW":
            case "NNW":
            case "WNW":
                return `${north_west.point} ${north_west.arrow}`;
            case "NNE":
            case "NE":
            case "ENE":
                return `${north_east.point} ${north_east.arrow}`;
            case "SW":
            case "WSW":
            case "SSW": 
                return `${south_west.point} ${south_west.arrow}`;
            case "ESE":
            case "SE":
            case "SSE":
                return `${south_east.point} ${south_east.arrow}`;
        }
    },

    getWindSpeed: (windSpeed, windDir) => {
        if (!windDir) {
            return (windSpeed === 0) ? "Штиль" : `${windSpeed} м/с`;
        }
        return (windSpeed === 0) ? "Штиль" : `${windSpeed} м/с, ${windDir}`;
    },

    renderTemp: (forecast) => {
        return `<b>${module.exports.renderPlus(forecast.temp)}${forecast.temp} °C</b>`;
    },

    renderWind: (forecast) => {
        return `<b>${module.exports.getWindSpeed(forecast.wind_speed, module.exports.getWindDirection(forecast.wind_direction))}</b>`;
    },

    forecastTemplate: (forecast, period, locationName) => {
        if (period === now) {
        return `Текущая погода для локации <b><i>${locationName}</i></b>:
Температура: ${module.exports.renderTemp(forecast)}
Осадки: ${module.exports.renderCloudness(forecast)}
Ветер: ${module.exports.renderWind(forecast)}
Давление: <b>${forecast.pressure} мм.рт.ст.</b>
Влажность: <b>${forecast.humidity}%</b>`
    } else {
        return `Погода на <b>${period}</b>, <b>${forecast.date}</b> для локации <b><i>${locationName}!</i></b>:
Температура: ${module.exports.renderTemp(forecast)}
Осадки: ${module.exports.renderCloudness(forecast)}
Ветер: ${module.exports.renderWind(forecast)}
Влажность: <b>${forecast.humidity}%</b>`
        }
    }
}

