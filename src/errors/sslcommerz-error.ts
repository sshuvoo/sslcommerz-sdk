export class SSLCommerzError extends Error {
  public readonly code: string
  public readonly details?: unknown

  constructor(message: string, code: string, details?: unknown) {
    super(message)
    this.name = 'SSLCommerzError'
    this.code = code
    this.details = details
    Object.setPrototypeOf(this, SSLCommerzError.prototype)
  }
}

export class ValidationError extends SSLCommerzError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class NetworkError extends SSLCommerzError {
  public readonly statusCode?: number

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message, 'NETWORK_ERROR', details)
    this.name = 'NetworkError'
    this.statusCode = statusCode
    Object.setPrototypeOf(this, NetworkError.prototype)
  }
}

export class APIError extends SSLCommerzError {
  public readonly response: unknown

  constructor(message: string, response: unknown) {
    super(message, 'API_ERROR', response)
    this.name = 'APIError'
    this.response = response
    Object.setPrototypeOf(this, APIError.prototype)
  }
}

export class ConfigurationError extends SSLCommerzError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR')
    this.name = 'ConfigurationError'
    Object.setPrototypeOf(this, ConfigurationError.prototype)
  }
}
