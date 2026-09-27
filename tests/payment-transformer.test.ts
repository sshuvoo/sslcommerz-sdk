import { describe, it, expect } from 'vitest'
import { transformPaymentInitData, validatePaymentInitData } from '../src/transformers/payment-transformer'
import type { PaymentInitData } from '../src/types'

describe('payment-transformer', () => {
  const validData: PaymentInitData = {
    store_id: 'test_store',
    store_passwd: 'test_pass',
    productcategory: 'test',
    tran_id: 'TXN001',
    total_amount: 100,
    currency: 'BDT',
    success_url: 'https://example.com/success',
    fail_url: 'https://example.com/fail',
    cancel_url: 'https://example.com/cancel',
    shipping_method: 'Courier',
    product_name: 'Test Product',
    product_category: 'Electronic',
    product_profile: 'general',
    cus_name: 'Test User',
    cus_email: 'test@example.com',
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01711111111',
  }

  describe('transformPaymentInitData', () => {
    it('should transform all fields correctly', () => {
      const result = transformPaymentInitData(validData)

      expect(result.store_id).toBe('test_store')
      expect(result.store_passwd).toBe('test_pass')
      expect(result.tran_id).toBe('TXN001')
      expect(result.total_amount).toBe(100)
      expect(result.currency).toBe('BDT')
      expect(result.cus_name).toBe('Test User')
      expect(result.cus_email).toBe('test@example.com')
    })

    it('should include optional fields when provided', () => {
      const dataWithOptional: PaymentInitData = {
        ...validData,
        ipn_url: 'https://example.com/ipn',
        emi_option: 1,
        emi_max_inst_option: 12,
        emi_selected_inst: 6,
        value_a: 'custom_a',
        value_b: 'custom_b',
      }

      const result = transformPaymentInitData(dataWithOptional)

      expect(result.ipn_url).toBe('https://example.com/ipn')
      expect(result.emi_option).toBe(1)
      expect(result.emi_max_inst_option).toBe(12)
      expect(result.emi_selected_inst).toBe(6)
      expect(result.value_a).toBe('custom_a')
      expect(result.value_b).toBe('custom_b')
    })

    it('should handle undefined optional fields', () => {
      const result = transformPaymentInitData(validData)

      expect(result.ipn_url).toBeUndefined()
      expect(result.emi_option).toBeUndefined()
      expect(result.cus_fax).toBeUndefined()
    })
  })

  describe('validatePaymentInitData', () => {
    it('should not throw for valid data', () => {
      expect(() => validatePaymentInitData(validData)).not.toThrow()
    })

    it('should throw for missing required fields', () => {
      const invalidData = { ...validData, cus_name: '' }
      expect(() => validatePaymentInitData(invalidData)).toThrow('Missing required fields')
    })

    it('should throw for zero total_amount', () => {
      const invalidData = { ...validData, total_amount: 0 }
      expect(() => validatePaymentInitData(invalidData)).toThrow('total_amount must be greater than 0')
    })

    it('should throw for negative total_amount', () => {
      const invalidData = { ...validData, total_amount: -10 }
      expect(() => validatePaymentInitData(invalidData)).toThrow('total_amount must be greater than 0')
    })

    it('should throw for invalid email', () => {
      const invalidData = { ...validData, cus_email: 'not-an-email' }
      expect(() => validatePaymentInitData(invalidData)).toThrow('cus_email must be a valid email address')
    })

    it('should throw for invalid success_url', () => {
      const invalidData = { ...validData, success_url: 'not-a-url' }
      expect(() => validatePaymentInitData(invalidData)).toThrow('success_url must be a valid URL')
    })

    it('should throw for invalid fail_url', () => {
      const invalidData = { ...validData, fail_url: 'not-a-url' }
      expect(() => validatePaymentInitData(invalidData)).toThrow('fail_url must be a valid URL')
    })

    it('should throw for invalid cancel_url', () => {
      const invalidData = { ...validData, cancel_url: 'not-a-url' }
      expect(() => validatePaymentInitData(invalidData)).toThrow('cancel_url must be a valid URL')
    })
  })
})
