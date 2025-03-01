// http status
const STATUS_500 = () => {
    return {
        message: "Something went wrong",
        data: null,
        success: false
    }
}

const STATUS_400 = (message) => {
    return {
        message,
        data: null
    }
}

const STATUS_200 = (msg, success) => {
    return {
        message: msg,
        success: success
    }
}

const STATUS_200_WITH_DATA = (data, success, msg = 'Operation Successfully') => {
    return {
        message: msg,
        data,
        success
    }
}

module.exports = {STATUS_400, STATUS_200, STATUS_200_WITH_DATA, STATUS_500}