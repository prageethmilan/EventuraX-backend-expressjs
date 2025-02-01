const {authError} = require('../const/error')

const authValidation = (data) => {
    const error = {...authError}

    if (Object.keys(data).length === 2) {
        for (const key in data) {
            if (data[key] === "") {
                error[key] = true
                error.message = `${key} should not be empty`

                return error
            }
        }
    } else {
        error.message = 'Email and password should not be empty'
    }
    return error
}

module.exports = {
    authValidation
}