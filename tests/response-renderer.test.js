const { forecastTypes: { now, tomorrow } } = require('../forecast');
const { forecastTemplate, getDayPart, getCloudness, renderPlus, getWindDirection, getWindSpeed } = require('../response-renderer');

describe('renderer-tests', () => {
    test('should get daypart', () => {
        const parts = [
            { isDay: 1, partname: 'day' },
            { isDay: 1, partname: 'night' }
        ];

        parts.forEach(part => {
            const returnedPart = getDayPart(part.isDay);
            expect(returnedPart).toBe(part.partname);
        });
    });

    test('should return text for cloudness', () => {
        const parsedForecast = {
            temp: 9,
            cloudness: 1000,
            wind_speed: 4.2,
            wind_direction: 'WNW',
            pressure: 756,
            humidity: 66,
            isDay: 1
        };

        const dayParts = [
            { partName: 'day', EXPECTED_TEXT: 'Солнечно' },
            { partName: 'night', EXPECTED_TEXT: 'Ясно'}
        ];

        dayParts.forEach(dayPart => {
            const actualCloudnessText = getCloudness(parsedForecast.cloudness, 'Russian', dayPart.partName);

            expect(actualCloudnessText).toBe(dayPart.EXPECTED_TEXT);
        });
    });

    test('should return plus on positive temperature', () => {
        const cases = [
            { temp: 1, EXPEXCTED_STRING: '+' },
            { temp: 0, EXPEXCTED_STRING: '' },
            { temp: -1, EXPEXCTED_STRING: ''}
        ];

        cases.forEach(item => {
            const actualString = renderPlus(item.temp);

            expect(actualString).toBe(item.EXPEXCTED_STRING);
        });
    });

    const windDirectionCases = [
        { caseName: 'north', directions: ['N'], expectedDirection: 'С', expectedArrow: '\u{2B07}' },
        { caseName: 'south', directions: ['S'], expectedDirection: 'Ю', expectedArrow: '\u{2B06}' },
        { caseName: 'west', directions: ['W'], expectedDirection: 'З', expectedArrow: '\u{27A1}' },
        { caseName: 'east', directions: ['E'], expectedDirection: 'В', expectedArrow: '\u{2B05}' },
        { caseName: 'north-west', directions: ['NW', 'NNW', 'WNW'], expectedDirection: 'СЗ', expectedArrow: '\u{2198}' },
        { caseName: 'north-east', directions: ['NE', 'NNE', 'ENE'], expectedDirection: 'СВ', expectedArrow: '\u{2199}' },
        { caseName: 'south-east', directions: ['SE', 'ESE', 'SSE'], expectedDirection: 'ЮВ', expectedArrow: '\u{2196}' },
        { caseName: 'south-west', directions: ['SW', 'WSW', 'SSW'], expectedDirection: 'ЮЗ', expectedArrow: '\u{2197}' },
    ];

    const testWindDirections = (caseName, possibleDirections, expectedDirection, expectedArrow) => {
        test(`should return ${caseName} wind`, () => {
            possibleDirections.forEach(direction => {
                const actualString = getWindDirection(direction);
    
                expect(actualString).toBe(`${expectedDirection} ${expectedArrow}`);
            });
        });
    };

    windDirectionCases.forEach(windCase => {
        testWindDirections(windCase.caseName, windCase.directions, windCase.expectedDirection, windCase.expectedArrow);
    });

    test('should return wind speed and direction', () => {
        const cases = [
            { speed: 0, direction: 'СЗ \u{2198}', EXPEXCTED_STRING: 'Штиль' },
            { speed: 10, direction: 'Ю \u{2B06}', EXPEXCTED_STRING: '10 м/с, Ю \u{2B06}' }
        ];

        cases.forEach(item => {
            const actuslString = getWindSpeed(item.speed, item.direction);

            expect(actuslString).toBe(item.EXPEXCTED_STRING);
        });
    });

    test('should return only wind speed', () => {
        const cases = [
            { speed: 0, EXPEXCTED_STRING: 'Штиль' },
            { speed: 4.5, EXPEXCTED_STRING: '4.5 м/с' }
        ];

        cases.forEach(item => {
            const actuslString = getWindSpeed(item.speed);

            expect(actuslString).toBe(item.EXPEXCTED_STRING);
        });
    });

    test('should return current forecast', () => {
const EXPECTED_TEXT = `Текущая погода для локации <b><i>Москва</i></b>:
Температура: <b>+9 °C</b>
Осадки: <b>Переменная облачность</b>
Ветер: <b>4.2 м/с, СЗ \u{2198}</b>
Давление: <b>756 мм.рт.ст.</b>
Влажность: <b>66%</b>`;

        const parsedForecast = {
            temp: 9,
            cloudness: 1003,
            wind_speed: 4.2,
            wind_direction: 'WNW',
            pressure: 756,
            humidity: 66,
            isDay: 1
        };
        const forecastText = forecastTemplate(parsedForecast, now, 'Москва');

        expect(forecastText).toBe(EXPECTED_TEXT);
    });

    test('should return tomorrows forecst', () => {
const EXPECTED_TEXT = `Погода на <b>завтра</b>, <b>25.06.2020</b> для локации <b><i>Санкт-Петербург</i></b>:
Температура: <b>+7 °C</b>
Осадки: <b>Местами дождь</b>
Ветер: <b>4.8 м/с</b>
Влажность: <b>71%</b>`

        const parsedForecast = {
            temp: 7,
            cloudness: 1063,
            wind_speed: 4.8,
            humidity: 71,
            date: '25.06.2020'
        };

        const forecastText = forecastTemplate(parsedForecast, tomorrow, 'Санкт-Петербург');

        expect(forecastText).toBe(EXPECTED_TEXT);
    });
});
