const authService = require('../services/authServices')
const userSerivce = require('../services/userServices')
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


            //If is ok, fetch user's info and then sets userData in the request body
            const userInfo = await userSerivce.getUserByEmail(decoded.userData.email)
            req.userData = {
                id: userInfo.id,
                username: userInfo.username,
                imageURL: userInfo.image_url,
                email: userInfo.email
            }
            next()

        } catch (error) {
            console.log('Error verificando el último token dentro de la BD.')
            return res.status(500).json({ error: 'Error interno del servidor.' })
        }
    })
}

module.exports = verifyTokenMiddleware