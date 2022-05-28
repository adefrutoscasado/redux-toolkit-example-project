
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const jwtVerify = promisify(jwt.verify)
const { UnauthorizedError } = require('../errors')

function getBearerToken(req) {
  const queryKey = 'access_token'
  const bodyKey = 'access_token'
  const headerKey = 'Bearer'
  let token, error

  if (req.query && req.query[queryKey]) {
    token = req.query[queryKey]
  }

  if (req.body && req.body[bodyKey]) {
    if (token) {
      error = true
    }
    token = req.body[bodyKey]
  }

  if (req.headers && req.headers.authorization) {
    let parts = req.headers.authorization.split(' ')
    if (parts.length === 2 && parts[0] === headerKey) {
      if (token) {
        error = true
      }
      token = parts[1]
    }
  }

  // RFC6750 states the access_token MUST NOT be provided
  // in more than one place in a single request.
  if (error) {
    return false
  } else {
    return token
  }
}

const generateAccessToken = (req, payload) => {
  return jwt.sign({
    data: payload
  }, req.app.get('JWT_SECRET'), { expiresIn: '30 mins' })
}

const generateRefreshToken = (req, payload) => {
  return jwt.sign({
    data: payload
  }, req.app.get('REFRESH_JWT_SECRET'), { expiresIn:  '30 days' })
}

const verifyAccessToken = async (req) => {
  const token = getBearerToken(req)
  if (!token) throw new UnauthorizedError(`Token not found in request. Make sure you are providing the token using header 'Authorization: Bearer {{token}}'`)
  let decoded
  try {
    decoded = await jwtVerify(token, req.app.get('JWT_SECRET'))
  } catch (error) {
    throw new UnauthorizedError('Invalid token', { error })
  }
  return decoded.data
}

const verifyRefreshToken = async (req) => {
  const token = req.body.refresh_token
  if (!token) throw new UnauthorizedError(`Token not found in request. Make sure you are providing the token using body`)
  let decoded
  try {
    decoded = await jwtVerify(token, req.app.get('REFRESH_JWT_SECRET'))
  } catch (error) {
    throw new UnauthorizedError('Invalid token', { error })
  }
  return decoded.data
}

module.exports = {
  getBearerToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
}
