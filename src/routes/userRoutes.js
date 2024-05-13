const express = require('express')
const userRouter = express.Router()
const userController = require('../controllers/userController')
const verifyTokenMiddleware = require('../helpers/verifyToken')

userRouter.post("/login", userController.loginUserNormal)

userRouter.post("/register", userController.registerUserNormal)

//Recordar pasar el JWT como 'token' en el headeer
userRouter.get("/verify-token", verifyTokenMiddleware, userController.verifyToken);

module.exports = userRouter