import { describe, it, expect } from 'vitest'
import { createConfig } from '../src/config/sslcommerz-config'
import { ConfigurationError } from '../src/errors'

describe('sslcommerz-config', () => {
  describe('createConfig', () => {
    it('should create sandbox config when isLive is false', () => {
      const config = createConfig('store123', 'pass123', false)

      expect(config.storeId).toBe('store123')
      expect(config.storePassword).toBe('pass123')
      expect(config.isLive).toBe(false)
      expect(config.baseUrl).toBe('https://sandbox.sslcommerz.com')
      expect(config.initUrl).toBe('https://sandbox.sslcommerz.com/gwprocess/v4/api.php')
      expect(config.validationUrl).toBe('https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php')
    })

    it('should create live config when isLive is true', () => {
      const config = createConfig('store123', 'pass123', true)

      expect(config.isLive).toBe(true)
      expect(config.baseUrl).toBe('https://securepay.sslcommerz.com')
      expect(config.initUrl).toBe('https://securepay.sslcommerz.com/gwprocess/v4/api.php')
    })

    it('should throw ConfigurationError when storeId is empty', () => {
      expect(() => createConfig('', 'pass123', false)).toThrow(ConfigurationError)
    })

    it('should throw ConfigurationError when storePassword is empty', () => {
      expect(() => createConfig('store123', '', false)).toThrow(ConfigurationError)
    })

    it('should trim whitespace from storeId and storePassword', () => {
      const config = createConfig('  store123  ', '  pass123  ', false)

      expect(config.storeId).toBe('store123')
      expect(config.storePassword).toBe('pass123')
    })

    it('should allow overriding URLs', () => {
      const config = createConfig('store123', 'pass123', false, {
        initUrl: 'https://custom.com/init',
        timeout: 5000,
      })

      expect(config.initUrl).toBe('https://custom.com/init')
      expect(config.timeout).toBe(5000)
    })

    it('should set default timeout to 30000', () => {
      const config = createConfig('store123', 'pass123', false)
      expect(config.timeout).toBe(30000)
    })

    it('should set default headers', () => {
      const config = createConfig('store123', 'pass123', false)
      expect(config.headers).toEqual({
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      })
    })
  })
})
