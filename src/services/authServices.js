const { pool } = require('../config/database')
const userService = require('./userServices')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const verifyLogin = async (email, password) => {
    const user = await userService.getUserByEmail(email)

    if (!user) {
        throw new Error("Credenciales incorrectas.")
    }

    //If user's password == null, is a Google account 
    if (user.password == null) {
        throw new Error("Este E-mail está asociado a una cuenta con Google.")
    }

    //Compare password
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
        throw new Error("Credenciales incorrectas.")
    }

    //Info to keep into JWT token
    const jwtUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        imageURL: user.image_url,
    }
    //Generates Token
    const token = jwt.sign({ userData: jwtUser }, process.env.JWT_SECRET, { expiresIn: '365d' })

    //Update token in DB
    await userService.updateToken(token, email)

    return { user: jwtUser, token }
}

const verifyTokenInDB = async (email, token) => {
    //Verifies if last_token is the same
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND last_token = $2', [email, token])

    return result.rowCount > 0
}

module.exports = { verifyLogin, verifyTokenInDB }