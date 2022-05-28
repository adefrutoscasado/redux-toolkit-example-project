
const { asyncWrap } = require('./../utils')
const { verifyRefreshToken, generateAccessToken, generateRefreshToken } = require('./../services/jwt')
const fs = require('fs')
const express = require('express')
const { UnauthorizedError } = require('../errors')
const server = express()

const usersDb = JSON.parse(fs.readFileSync('mock-server/users.json', 'UTF-8'))

// Check if the user exists in database
function findUserByCredentials({ email, password }) {
  return usersDb.users.find(user => user.email === email && user.password === password)
}

server.post('/login', asyncWrap((req, res) => {
  const { email, password } = req.body

  if (!findUserByCredentials({ email, password })) {
    throw new UnauthorizedError('Incorrect email or password')
  }

  const payload = {...findUserByCredentials({ email, password })}
  delete payload['password']

  res.status(200).json({
    user: payload,
    access_token: generateAccessToken(req, payload),
    refresh_token: generateRefreshToken(req, payload),
  })
}))

server.post('/refresh',
  asyncWrap(async (req, res, next) => {
    const payload = await verifyRefreshToken(req)
    return res.json({
      user: payload,
      access_token: generateAccessToken(req, payload),
      refresh_token: generateRefreshToken(req, payload),
    })
  })
)

module.exports = {
  auth: server
}