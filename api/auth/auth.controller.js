const authService = require('./auth.service')
const logger = require('../../services/logger.service')

const DEFAULT_EXP_TIME = 1000 * 60 * 60 * 3 // 3 hours
// That way can be controlled with Environment Variables in render website!
const LOGIN_EXPIRATION_TIME = +process.env?.LOGIN_EXPIRATION_TIME || DEFAULT_EXP_TIME

async function login(req, res) {
    const { username, password } = req.body
    try {
        const user = await authService.login(username, password)
        const loginToken = authService.getLoginToken(user)
        logger.info('User login: ', user)
        res.cookie('loginToken', loginToken, { maxAge: LOGIN_EXPIRATION_TIME })
        res.json(user)
    } catch (err) {
        logger.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

async function signup(req, res) {
    try {
        const credentials = req.body
        // Never log passwords
        // logger.debug(credentials)
        const account = await authService.signup(credentials)
        logger.debug(`auth.route - new account created: ` + JSON.stringify(account))
        const user = await authService.login(credentials.username, credentials.password)
        logger.info('User signup:', user)
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken, { maxAge: LOGIN_EXPIRATION_TIME })
        res.json(user)
    } catch (err) {
        logger.error('Failed to signup ' + err)
        res.status(500).send({ err: 'Failed to signup' })
    }
}

async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}

module.exports = {
    login,
    signup,
    logout
}