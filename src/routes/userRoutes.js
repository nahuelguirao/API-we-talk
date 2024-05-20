const express = require('express')
const userRouter = express.Router()
const userController = require('../controllers/userController')
const verifyTokenMiddleware = require('../middlewares/verifyToken')

userRouter.post("/login", userController.loginUserNormal)

userRouter.post("/register", userController.registerUserNormal)

userRouter.post("/google", userController.google)

userRouter.post("/change-username", userController.changeUsername)

//Remember passing JWT as 'token' in the header
userRouter.get("/verify-token", verifyTokenMiddleware, userController.verifyToken);


module.exports = userRouter