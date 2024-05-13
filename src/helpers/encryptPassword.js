const bcrypt = require('bcrypt')

const encryptPassword = async (password) => {
    try {
        const hash = await bcrypt.hash(password, 10)
        return hash
    } catch (error) {
        console.log('Error encriptando la contraseña: ', error)
        throw new Error('Error encriptando la contraseña')
    }
}

module.exports = encryptPassword
