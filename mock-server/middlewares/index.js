
const { asyncWrap, sleep, randomIntFromInterval } = require('./../utils')
const { verifyAccessToken } = require('../services/jwt')


const validateToken = asyncWrap(async (req, res, next) => {
  const data = await verifyAccessToken(req)
  req.auth = data
  next()
})

const simulateDelay = asyncWrap(async (req, res, next) => {
  const ms = randomIntFromInterval(500, 1000)
  await sleep(ms)
  next()
})

module.exports= {
  validateToken,
  simulateDelay,
}