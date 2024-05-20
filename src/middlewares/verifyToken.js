const authService = require('../services/authServices')
const jwt = require('jsonwebtoken');

const verifyTokenMiddleware = async (req, res, next) => {
    const token = req.headers.token

    if (!token) {
        return res.status(400).json({ error: 'Token no proporcionado.' })
    }

    //Verifies if the JWT is valid
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token de autenticación inválido.' })
        }

        try {
            //Check if token is valid  
            const tokenIsValid = await authService.verifyTokenInDB(decoded.userData.email, token)

            if (!tokenIsValid) {
                return res.status(401).json({ error: 'Token inválido.' })
            }

            //If is ok, sets userData in the request body
            req.userData = decoded.userData
            next()

        } catch (error) {
            console.log('Error verificando el último token dentro de la BD.')
            return res.status(500).json({ error: 'Error interno del servidor.' })
        }
    })
}

module.exports = verifyTokenMiddleware