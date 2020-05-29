const bot = require('../bot');
const { user } = require('../db');
const log = require('../log');
const { getCoordsByLocationName, getIndexOfLocation, moveLocation } = require('../geolocation');

module.exports = saveLocation = async (msg) => {
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
