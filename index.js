const EventEmitter = require('events')
const myEmitter = new EventEmitter();
module.exports = myEmitter;
const bot = require('./bot');
require('dotenv').config();
const { telegramBotToken } = require('./config/tokens');
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const { dbConnect } = require('./db');


myEmitter.once('startServer', () => {
    console.log('Starting server');
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
})

dbConnect();
