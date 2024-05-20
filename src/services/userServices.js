const { pool } = require('../config/database')

//Finds user info by email
const getUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1'
    const result = await pool.query(query, [email])

    return result.rows[0]
}

//Verifies if the E-mail is available (unique)
const isEmailAvailable = async (email) => {
    const query = 'SELECT COUNT(*) AS count FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0].count === '0';
}

//Verifies if an username is available (unique)
const isUsernameAvailable = async (username) => {
    const query = 'SELECT COUNT(*) AS count FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);

    return result.rows[0].count === '0';
}

//Inserts 'NORMAL' user in DB
const insertNormalUser = async (userData) => {
    const { username, email, passwordEncrypted } = userData

    const query = 'INSERT INTO users (username, email, password, auth_provider) VALUES ($1, $2, $3, $4)'
    await pool.query(query, [username, email, passwordEncrypted, 'normal'])
}

//Inserts 'GOOGLE' user in DB
const insertGoogleUser = async (userData) => {
    const { name, email, imageURL, uid } = userData

    const isNameAvailable = await isUsernameAvailable(name)

    const createdUsername = isNameAvailable ? name : null

    const query = 'INSERT INTO users (username, image_url, email, auth_provider, google_id) VALUES ($1, $2, $3, $4, $5)'
    await pool.query(query, [createdUsername, imageURL, email, 'google', uid])

    const userInfo = await getUserByEmail(email)
    const returnData = {
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email,
        imageURL: userInfo.image_url
    }

    return returnData
}

//Updates user's last token in DB
const updateToken = async (token, email) => {
    const updateQuery = 'UPDATE users SET last_token = $1 WHERE email = $2'
    await pool.query(updateQuery, [token, email])
}

//Updates user's username 
const updateUsername = async (username, email) => {
    const query = 'UPDATE users SET username = $1 WHERE email = $2'
    await pool.query(query, [username, email])
}


module.exports = { getUserByEmail, isEmailAvailable, isUsernameAvailable, insertNormalUser, insertGoogleUser, updateToken, updateUsername }