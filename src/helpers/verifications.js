const { pool } = require('../services/database')

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

module.exports = { verifyUser, verifyEmail, verifyPassword }