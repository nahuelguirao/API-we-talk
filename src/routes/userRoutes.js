const express = require('express')
const userRouter = express.Router()
const { pool } = require('../services/database')
const bcrypt = require('bcrypt')

const verifyPassword = (password) => {
    if (password.length < 8) {
        return false
    }

    //Verifies if +1 upper case
    if (!/[A-Z]/.test(password)) {
        return false
    }

    //Verifies special character
    if (!/[$&+,:;=?@#|'<>.^*()%!-]/.test(password)) {
        return false
    }

    return true
}

const verifyUser = async (username) => {
    if (username.length < 4) {
        return false
    }

    if (username.length > 50) {
        return false
    }

    try {
        const result = await pool.query('SELECT COUNT(*) AS count FROM users WHERE username = $1', [username])

        if (result.rows[0].count === '0') {
            return true
        } else {
            return false
        }

    } catch (error) {
        console.log(error)
        console.log('Error verificando username.')
        return false
    }
}

const verifyEmail = async (email) => {
    if (email.length > 100) {
        return false
    }

    //Verify is email
    if (!/^[\w-]+(\.[\w-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})$/.test(email)) {
        return false
    }

    try {
        const result = await pool.query('SELECT COUNT(*) AS count FROM users WHERE email = $1', [email])

        if (result.rows[0].count === '0') {
            return true
        } else {
            return false
        }
    } catch (error) {
        console.log('Error verificando email.')
        return false
    }
}

const encryptPassword = async (password) => {
    try {
        const hash = await bcrypt.hash(password, 10)
        return hash
    } catch (error) {
        console.log('Error encriptando la contraseña: ', error)
        throw new Error('Error encriptando la contraseña')
    }
}


userRouter.post("/", async (req, res) => {
    try {
        const { username, email, password } = req.body

        //Verify username
        if (!(await verifyUser(username))) {
            throw new Error('Nombre de usuario ya en uso o inválido.')
        }

        if (!(await verifyEmail(email))) {
            throw new Error('E-mail ya en uso o formato inválido')
        }

        if (!verifyPassword(password)) {
            throw new Error('Formato de la contraseña inválido.')
        }

        //Encrypt password before register user
        const passwordEncrypted = await encryptPassword(password)

        const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)'
        await pool.query(query, [username, email, passwordEncrypted])

        res.status(200).json({ message: '¡Usuario registrado correctamente!' })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

})

module.exports = userRouter