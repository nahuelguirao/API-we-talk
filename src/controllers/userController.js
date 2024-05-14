const { pool } = require('../services/database')
const { verifyUser, verifyEmail, verifyPassword } = require('../helpers/verifications')
const encryptPassword = require('../helpers/encryptPassword')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//VERIFY JWT TOKEN 
const verifyToken = (req, res) => {
    res.status(200).json({ message: 'Token de autenticación válido.', userData: req.userData });
}

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
            username: user.username,
            email: user.email
        }

        //Generates Token
        const token = jwt.sign({ userData: jwtUser }, process.env.JWT_SECRET, { expiresIn: '365d' })

        //Updates user's valid token in DB
        const updateQuery = 'UPDATE users SET last_token = $1 WHERE email = $2'
        await pool.query(updateQuery, [token, user.email])

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

//LOGIN AND REGISTER WITH GOOGLE
const google = async (req, res) => {
    const { name, email, imageURL } = req.body

    if (!name || !email || !imageURL) {
        return res.status(400).json({ message: 'Enviar name, email y imageURL.' })
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

        //It means that user already exist
        if (result.rowCount > 0) {
            const existingUser = await pool.query('SELECT username, email, image_url FROM users_google WHERE email = $1', [email])
            const loginToken = jwt.sign({ userData: existingUser.rows[0] }, process.env.JWT_SECRET, { expiresIn: '365d' })

            await pool.query('UPDATE users SET last_token = $1 WHERE email = $2', [loginToken, email])

            return res.status(200).json({ token: loginToken, user: existingUser.rows[0] })
        }

        const newUser = { username: name, email, imageURL }

        const registerToken = jwt.sign({ userData: newUser }, process.env.JWT_SECRET, { expiresIn: '365d' })

        await pool.query('INSERT INTO users (email, last_token) VALUES ($1, $2)', [email, registerToken])
        await pool.query('INSERT INTO users_google (username, email, image_url) VALUES ($1, $2, $3)', [name, email, imageURL])

        res.status(200).json({ token: registerToken, user: newUser })
    } catch (error) {
        console.log('Error en register with google: ', error)
        res.status(500).json({ error: 'Error registrando o logeando al usuario con google.' })
    }
}

module.exports = { loginUserNormal, registerUserNormal, google, verifyToken }