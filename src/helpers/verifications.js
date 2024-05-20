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

const verifyUser = (username) => {
    if (username.length < 4) {
        return false
    }

    if (username.length > 50) {
        return false
    }
    return true
}

const verifyEmail = (email) => {
    if (email.length > 100) {
        return false
    }

    //Verify is email
    if (!/^[\w-]+(\.[\w-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})$/.test(email)) {
        return false
    }

    return true
}

module.exports = { verifyUser, verifyEmail, verifyPassword }