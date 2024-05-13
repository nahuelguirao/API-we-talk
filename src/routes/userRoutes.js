const express = require('express')
const userRouter = express.Router()
const userController = require('../controllers/userController')

userRouter.post("/register", userController.registerUserNormal)

userRouter.post("/login", userController.loginUserNormal)

module.exports = userRouter