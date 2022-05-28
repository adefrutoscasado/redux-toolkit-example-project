
const asyncWrap = (fn) =>
  function asyncUtilWrap(req, res, next, ...args) {
    const fnReturn = fn(req, res, next, ...args)
    return Promise.resolve(fnReturn).catch(next)
  }

const sleep = ms => new Promise(r => setTimeout(r, ms))

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = {
  asyncWrap,
  sleep,
  randomIntFromInterval,
}