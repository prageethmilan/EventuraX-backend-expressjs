// http status
const STATUS_500 = () => {
    return {
        message: "Something went wrong",
        data: null,
        status: false
    }
}

const STATUS_400 = (message) => {
    return {
        message,
        data: null
    }
}

const STATUS_200 = (msg, status) => {
    return {
        message: msg,
        status: status
    }
}

const STATUS_200_WITH_DATA = (data, status, msg = 'Operation Successfully') => {
    return {
        message: msg,
        data,
        status
    }
}

module.exports = {STATUS_400, STATUS_200, STATUS_200_WITH_DATA, STATUS_500}