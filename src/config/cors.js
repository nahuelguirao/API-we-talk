//Cors Config
const whitelist = ['http://localhost:5174', 'http://localhost:5173']

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

module.exports = corsOptions