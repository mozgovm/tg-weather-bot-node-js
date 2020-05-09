const cloudnessCodes = require('./config/weather_confs/cloudness-codes');
const { north, south, west, east, north_west, north_east, south_west, south_east } = require('./config/weather_confs/wind-directions');
const { forecastTypes: { now } } = require('./forecast');

const getDayPart = (isDay) => {
    return (isDay === 1) ? "day" : "night"
};

const getCloudness = (code, lang, dayPart) => {
    return cloudnessCodes[code][lang][`${dayPart}_text`];
};

const renderPlus = (temp) => {
    return (temp > 0) ? "+" : "";
};

const getWindDirection = (windDir) => {
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
};

const getWindSpeed = (windSpeed, windDir) => {
    if (!windDir) {
        return (windSpeed === 0) ? "Штиль" : `${windSpeed} м/с`;
    }
    return (windSpeed === 0) ? "Штиль" : `${windSpeed} м/с, ${windDir}`;
};

const renderTemp = (forecast) => {
    return `<b>${renderPlus(forecast.temp)}${forecast.temp} °C</b>`;
};

const renderCloudness = (forecast) => {
    return `<b>${getCloudness(forecast.cloudness, 'Russian', getDayPart(forecast.isDay))}</b>`;
};

const renderWind = (forecast) => {
    return `<b>${getWindSpeed(forecast.wind_speed, getWindDirection(forecast.wind_direction))}</b>`;
};

module.exports = (forecast, period, locationName) => {
    if (period === now) {
        return `Текущая погода для локации <b><i>${locationName}</i></b>:
Температура: ${renderTemp(forecast)}
Осадки: ${renderCloudness(forecast)}
Ветер: ${renderWind(forecast)}
Давление: <b>${forecast.pressure} мм.рт.ст.</b>
Влажность: <b>${forecast.humidity}%</b>`
    } else {
        return `Погода на <b>${period}</b>, <b>${forecast.date}</b> для локации <b><i>${locationName}</i></b>:
Температура: ${renderTemp(forecast)}
Осадки: ${renderCloudness(forecast)}
Ветер: ${renderWind(forecast)}
Влажность: <b>${forecast.humidity}%</b>`
    }
};
