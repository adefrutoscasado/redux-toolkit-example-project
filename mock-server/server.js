/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const bodyParser = require('body-parser')
const cors = require('cors')
const jsonServer = require('json-server')
const { NotFoundError } = require('./errors')
const { asyncWrap } = require('./utils')
const { auth } = require('./routes/auth')
const { validateToken, simulateDelay } = require('./middlewares')
const morganBody = require('morgan-body')
const express = require('express')
const app = express()
const jsonServerRouter = jsonServer.router('mock-server/db.json')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())
morganBody(app, {
  logReqDateTime: false,
  logReqUserAgent: false,
  logIP: false,
})

app.set('JWT_SECRET', 'JWT_SECRET')
app.set('REFRESH_JWT_SECRET', 'REFRESH_JWT_SECRET')

app.use(simulateDelay)

app.use(`/auth`, auth)

// // Simulate unexpected error
// app.use(`*`, asyncWrap((req, res, next) => {
//   throw new Error('Unexpected error')
// }))

// If a route is not found here, json-server returns a 404 error with message '{}'
app.use(validateToken, jsonServerRouter)

// 404 Not Found Errors
app.use(asyncWrap((req, res, next) => {
  throw new NotFoundError('Endpoint not Found')
}))

// 500 Internal Errors
app.use((err, req, res, next) => {
  console.log(err.message)
  console.log(err.stack)
  res.status(err.status || 500)
  res.send({
    message: err.message,
    errors: err.errors,
    ...(err.additionalInfo || {}),
  })
})

module.exports = {
  app
}
