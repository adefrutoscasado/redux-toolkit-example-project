
const { asyncWrap } = require('./../utils')
const { verifyRefreshToken, generateAccessToken, generateRefreshToken } = require('./../services/jwt')
const fs = require('fs')
const express = require('express')
const { UnauthorizedError } = require('../errors')
const server = express()

const usersDb = JSON.parse(fs.readFileSync('mock-server/users.json', 'UTF-8'))

// Check if the user exists in database
function findUserByCredentials({ username, password }) {
  return usersDb.users.find(user => user.username === username && user.password === password)
}

server.post('/login', asyncWrap((req, res) => {
  const { username, password } = req.body

  if (!findUserByCredentials({ username, password })) {
    throw new UnauthorizedError('Incorrect username or password')
  }

  const payload = {...findUserByCredentials({ username, password })}
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
