require('dotenv').config()
const express = require('express')
const userRouter = require('./routes/userRoutes')
const { checkDatabaseConnection } = require('./services/database')
const cors = require('cors')

//Init app
const app = express()

//Check if conection with Postgre is correct
checkDatabaseConnection()

//Cors Config
const whitelist = ['http://localhost:5174']

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

//Middlewares and routers
app.use(cors(corsOptions));
app.use(express.json())
app.use("/users", userRouter)


//Starts server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`)
})