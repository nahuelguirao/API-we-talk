require('dotenv').config()
const express = require('express')
const userRouter = require('./routes/userRoutes')
const { checkDatabaseConnection } = require('./services/database')

//Init app
const app = express()

//Check if conection with Postgre is correct
checkDatabaseConnection()

//Middlewares and routers
app.use(express.json())
app.use("/users", userRouter)


//Starts server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`)
})