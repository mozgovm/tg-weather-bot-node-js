const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: {
        type: String,
        unique: true
    },
    lastLocations: [
        {
            locationName: String,
            lat: Number,
            lon: Number
        }
    ]
});
const dbName = 'weather-bot-users';

const MONGODB_URI = `mongodb+srv://MyMongoDBUSER:${process.env.MONGODB_PASSWORD}@weatherbotdb-n7lcm.mongodb.net/${dbName}?retryWrites=true&w=majority`

module.exports = {
    user: mongoose.model('user', userSchema),

    dbConnect: function () {
        mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    },

    clearDB: function() {
        mongoose.connection.dropDatabase();
    }
};
