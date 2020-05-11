const telegramBot = require("node-telegram-bot-api");
require('dotenv').config();
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const log = require('./log');
const { getForecastByCoords, forecastTypes: { now, today, tomorrow } } = require('./forecast');
const { getLocationName, getCoordsByLocationName, getIndexOfLocation, moveLocation } = require('./geolocation');
const { telegramBotToken } = require('./config/tokens');
const { user, dbConnect } = require('./db');
const forecastTemplate = require('./response-renderer');
const userQueue = []; // id чатов пользователей, от которых ожидается ввод локации

const bot = new telegramBot(telegramBotToken);

bot.setWebHook(`https://tg-weather-bot-node-js.herokuapp.com/weather_bot${telegramBotToken}`);

const app = new Koa();

const router = new Router();
router.post(`/weather_bot${telegramBotToken}`, ctx => {
    const { body } = ctx.request;
    bot.processUpdate(body);
    ctx.status = 200;
});

app.use(bodyParser());
app.use(router.routes());

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App is listening on ${port}`);
});

bot.on('message', async msg => {
    const waitingLocationFromUser = userQueue.includes(msg.chat.id);
    const locationChangeCancelled = msg.text === 'Отмена';
    const locationReceivedByGPS = msg.location;
    
    if (waitingLocationFromUser && !locationChangeCancelled && !locationReceivedByGPS) {
        const locationName = await saveLocation(msg).catch(e => {
            log.error(e.message);
            log.error(e.stack);
        });
        if (!locationName) {
            return;
        }
        let chatIndex = userQueue.indexOf(msg.chat.id);
        userQueue.splice(chatIndex, 1);

        log.info(`Received first location from user: ${msg.from.username}, chat_id ${msg.chat.id} removed from queue`);
        log.info(`User_queue: ${userQueue}`);

        await askForecastType(msg, locationName).catch(e => {
            log.error(e.message);
            log.error(e.stack);
        });
    }
}, userQueue);

dbConnect();

const askForecastType = async (msg, locationName) => {
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

const saveLocation = async (msg) => {
    const receivedLocation = msg.text;
    const { coords, locationName }  = await getCoordsByLocationName(receivedLocation).catch(e => {
        log.error(e.message);
        log.error(e.stack);
    }) || {};

    if (!coords) {
        bot.sendMessage(msg.chat.id, `По запросу "${receivedLocation}" не найдено ни одной локации, попробуйте еще раз`);
        return false;
    }

    const [longitude, latitude] = coords;
    const dbUser = await user.findOne({ userName: msg.from.username });
    const locationIndex = getIndexOfLocation(dbUser.lastLocations, locationName);

    if (locationIndex === -1) {
        dbUser.lastLocations.unshift({ locationName: locationName, lat: latitude, lon: longitude });
    } else {
        moveLocation(dbUser.lastLocations, locationIndex);
    }

    if (dbUser.lastLocations.length > 3) {
        do {
            dbUser.lastLocations.pop();
        } while (dbUser.lastLocations.length > 3)
    }

    dbUser.save()
    .then(() => log.info(`Location ${locationName} is set as current for user ${dbUser.userName}`))
    .catch((e) => {
        log.error(e.message);
        log.error(e.stack);
    });

    return locationName;
}

bot.onText(/\/start/, async msg => {
    userQueue.push(msg.chat.id);
    const dbUser = await user.findOne({ userName: msg.from.username });
    
    if (!dbUser) {
        const newUser = await user.create({ userName: msg.from.username });
        log.info(`Created new user: ${newUser.userName}`);
    }
    
    
    bot.sendMessage(msg.chat.id, 'Напишите название локации, для которой хотите узнать погоду или отправьте текущее местоположение (достутпно только для мобильных устройств)', {
        reply_markup: {
            keyboard: [
                [{
                    text: 'Отправить текущее место',
                    request_location: true
                }]
            ],
            one_time_keyboard: true,
            resize_keyboard: true
        }
    }, userQueue);

    log.info(`Waiting for location from user: ${msg.from.username}`);
    log.info(`User_queue: ${userQueue}`);
});

bot.onText(/отмена/i, async msg => {
    const dbUser = await user.findOne({ userName: msg.from.username });
    const { lastLocations: [location] } = dbUser;
    let chatIndex = userQueue.indexOf(msg.chat.id);
    userQueue.splice(chatIndex, 1);

    log.info(`Chat_id ${msg.chat.id} removed from queue`);
    log.info(`User_queue: ${userQueue}`);

    await askForecastType(msg, location.locationName).catch(e => {
        log.error(e.message);
        log.error(e.stack);
    });
}, userQueue);

bot.onText(/погода сейчас/i, async msg => {
    const dbUser = await user.findOne({ userName: msg.from.username });
    const { lastLocations: [location] } = dbUser;
    const forecast = await getForecastByCoords(location.lat, location.lon, now).catch(e => {
        log.error(e.message);
        log.error(e.stack);
    });

    log.debug(`${dbUser.userName} requested current forecast`);

    bot.sendMessage(msg.chat.id, forecastTemplate(forecast, now, location.locationName), {
        parse_mode: "HTML"
    });
});

bot.onText(/прогноз на сегодня/i, async msg => {
    const dbUser = await user.findOne({ userName: msg.from.username });
    const { lastLocations: [location] } = dbUser;
    const forecast = await getForecastByCoords(location.lat, location.lon, today).catch(e => {
        log.error(e.message);
        log.error(e.stack);
    });

    log.debug(`${dbUser.userName} requested forecast for today`);

    bot.sendMessage(msg.chat.id, forecastTemplate(forecast, today, location.locationName), {
        parse_mode: "HTML"
    });
});

bot.onText(/прогноз на завтра/i, async (msg) => {
    const dbUser = await user.findOne({ userName: msg.from.username });
    const { lastLocations: [location] } = dbUser;
    const forecast = await getForecastByCoords(location.lat, location.lon, tomorrow).catch(e => {
        log.error(e.message);
        log.error(e.stack);
    });

    log.debug(`${dbUser.userName} requested forecast for tomorrow`);

    bot.sendMessage(msg.chat.id, forecastTemplate(forecast, tomorrow, location.locationName), {
        parse_mode: "HTML"
    });
});

bot.onText(/изменить локацию/i, msg => {
    userQueue.push(msg.chat.id);
    bot.sendMessage(msg.chat.id, 'Напишите название локации, для которой хотите узнать погоду или отправьте текущее местоположение (достутпно только для мобильных устройств)', {
        reply_markup: {
            keyboard: [
                [{
                    text: 'Отправить текущее место',
                    request_location: true
                },
            {
                text: 'Отмена'
            }]
            ],
            resize_keyboard: true
        }
    });

    log.info(`Waiting for new location from user: ${msg.from.username}, chat_id: ${msg.chat.id}`);
    log.info(`User_queue: ${userQueue}`);
}, userQueue);

bot.on('location', async msg => {
    log.info(`User: ${msg.from.username} sent location via GPS`);
    const { latitude, longitude } = msg.location;

    const currentLocation = await getLocationName(latitude, longitude).catch(e => {
        log.error(e.message);
        log.error(e.stack);
    });
    const dbUser = await user.findOne({ userName: msg.from.username});

    const locationIndex = getIndexOfLocation(dbUser.lastLocations, currentLocation);

    if (locationIndex === -1) {
        dbUser.lastLocations.unshift({ locationName: currentLocation, lat: latitude, lon: longitude });
    } else {
        moveLocation(dbUser.lastLocations, locationIndex);
    }

    if (dbUser.lastLocations.length > 3) {
        do {
            dbUser.lastLocations.pop();
        } while (dbUser.lastLocations.length > 3)
    }

    dbUser.save()
    .then(() => {
        const chatIndex = userQueue.indexOf(msg.chat.id);
        userQueue.splice(chatIndex);

        log.info(`Location ${currentLocation} is set as current for user ${dbUser.userName}`);
        log.info(`Chat_id ${msg.chat.id} removed from queue`);
        log.info(`User_queue: ${userQueue}`);
    })
    .catch((e) => {
        log.error(e.message);
        log.error(e.stack);
    });
    

    await askForecastType(msg, currentLocation).catch(e => {
        log.error(e.message);
        log.error(e.stack);
    });
  }, userQueue);
