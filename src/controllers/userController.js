const { pool } = require('../services/database')
const { verifyUser, verifyEmail, verifyPassword } = require('../helpers/verifications')
const encryptPassword = require('../helpers/encryptPassword')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//LOGIN NORMAL (With form)
const loginUserNormal = async (req, res) => {
    try {
        const { email, password } = req.body

        const query = 'SELECT * FROM users WHERE email = $1'
        const result = await pool.query(query, [email])

        //Tries to find an user with the entered e-mail
        if (result.rowCount == 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' })
        }

        const user = result.rows[0]

        //Compare password
        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' })
        }

        //Info to keep into JWT token
        const jwtUser = {
            id: user.id,
            username: user.username,
            email: user.email
        }

        //Generates Token
        const token = jwt.sign({ userData: jwtUser }, process.env.JWT_SECRET, { expiresIn: '365d' })

        //Send token + user info (email + username)
        res.status(200).json({ token, user: jwtUser })
    } catch (error) {
        console.log('Error al intentar iniciar sesión: ', error)
        res.status(500).json({ error: 'Error interno del servidor.' })
    }
}

//REGISTRATION NORMAL (With form)
const registerUserNormal = async (req, res) => {
    try {
        const { username, email, password } = req.body

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

        //Inserts user's data into the database
        const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)'
        await pool.query(query, [username, email, passwordEncrypted])

        res.status(200).json({ message: '¡Usuario registrado correctamente!' })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = { loginUserNormal, registerUserNormal }