
class ApiError extends Error {
  constructor(message, status, additionalInfo) {
    super()
    this.status = status || 500
    this.message = message || 'Internal Error'
    this.additionalInfo = additionalInfo || {}
    // Capturing stack trace, excluding constructor call from it.
    // Error.captureStackTrace(this, this.constructor)
  }
}

class InternalError extends ApiError {
  constructor(message) {
    super(message || 'Internal Error', 500)
  }
}

class NotFoundError extends ApiError {
  constructor(message) {
    super(message || 'Not Found', 404)
  }
}

class UnauthorizedError extends ApiError {
  constructor(message, additionalInfo) {
    super(message || 'Unauthorized', 401, additionalInfo)
  }
}

module.exports = {
  ApiError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
}