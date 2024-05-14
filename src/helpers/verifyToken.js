const jwt = require('jsonwebtoken');
const { pool } = require('../services/database')

const verifyTokenMiddleware = async (req, res, next) => {
    const token = req.headers.token

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado.' })
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token de autenticación inválido.' })
        }

        try {
            //Gets user and compares last_token 
            const user = await pool.query('SELECT * FROM users WHERE email = $1 AND last_token = $2', [decoded.userData.email, token])

            if (user.rowCount == 0) {
                return res.status(401).json({ error: 'Token inválido.' })
            }

            req.userData = decoded.userData
            next()

        } catch (error) {
            console.log('Error verificando el último token dentro de la BD.')
            return res.status(500).json({ error: 'Error interno del servidor.' })
        }
    })
}

module.exports = verifyTokenMiddleware