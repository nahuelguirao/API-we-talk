const { pool } = require('../config/database')

const getUserByEmail = async (email) => {
    //Tries to find an user with the entered e-mail
    const query = 'SELECT * FROM users WHERE email = $1'
    const result = await pool.query(query, [email])

    return result.rows[0]
}

const getGoogleUser = async (email) => {
    //Gets existing google user info
    const existingUser = await pool.query('SELECT username, email, image_url FROM users_google WHERE email = $1', [email])

    return existingUser.rows[0]
}

const isEmailAvailable = async (email) => {
    //Verifies if the E-mail is available (unique)
    const query = 'SELECT COUNT(*) AS count FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0].count === '0';
}

const insertNormalUser = async (userData) => {
    const { username, email, passwordEncrypted } = userData

    //Insert new user into DB
    const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)'
    await pool.query(query, [username, email, passwordEncrypted])
}

const insertGoogleUser = async (userData, token) => {
    const { name, email, imageURL } = userData

    //Inserts only email + token in normal users database
    await pool.query('INSERT INTO users (email, last_token) VALUES ($1, $2)', [email, token])

    //Inserts info in google users database
    await pool.query('INSERT INTO users_google (username, email, image_url) VALUES ($1, $2, $3)', [name, email, imageURL])
}

const updateToken = async (token, email) => {
    //Updates user's last token in DB
    const updateQuery = 'UPDATE users SET last_token = $1 WHERE email = $2'
    await pool.query(updateQuery, [token, email])
}


module.exports = { getUserByEmail, getGoogleUser, updateToken, insertNormalUser, insertGoogleUser, isEmailAvailable }