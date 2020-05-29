const bot = require('../bot');

module.exports = askForecastType = async (msg, locationName) => {
    const forecastTypeKeyboard = [
        [{
            text: 'Погода сейчас'
        },
        {
            text: 'Прогноз на сегодня'
        }],
        [{
            text: 'Прогноз на завтра'
        },
        { 
            text: 'Изменить локацию'
        }]
    ];

    bot.sendMessage(msg.chat.id, `Выберите период прогноза для локации <b><i>${locationName}</i></b>`, {
        parse_mode: "HTML",
        reply_markup: {
            keyboard: forecastTypeKeyboard,
        resize_keyboard: true
        }
    });
};
