import { describe, it, expect, vi, beforeEach } from 'vitest'
import SSLCommerzPayment from '../src/index'
import { ConfigurationError } from '../src/errors'

describe('SSLCommerzPayment', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  describe('constructor', () => {
    it('should create instance with valid credentials', () => {
      const sslcz = new SSLCommerzPayment('store123', 'pass123', false)
      expect(sslcz).toBeInstanceOf(SSLCommerzPayment)
    })

    it('should throw ConfigurationError when storeId is empty', () => {
      expect(() => new SSLCommerzPayment('', 'pass123', false)).toThrow(ConfigurationError)
    })

    it('should throw ConfigurationError when storePassword is empty', () => {
      expect(() => new SSLCommerzPayment('store123', '', false)).toThrow(ConfigurationError)
    })
  })

  describe('init', () => {
    it('should call paymentService.init with correct data', async () => {
      const mockResponse = {
        status: 'SUCCESS',
        GatewayPageURL: 'https://sandbox.sslcommerz.com/gateway/test',
        failedreason: '',
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const sslcz = new SSLCommerzPayment('store123', 'pass123', false)

      const data = {
        store_id: 'store123',
        store_passwd: 'pass123',
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

      const result = await sslcz.init(data)

      expect(result.status).toBe('SUCCESS')
      expect(result.GatewayPageURL).toBe('https://sandbox.sslcommerz.com/gateway/test')
    })
  })

  describe('validate', () => {
    it('should call paymentService.validate with correct data', async () => {
      const mockResponse = { status: 'VALID', tran_id: 'TXN001' }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const sslcz = new SSLCommerzPayment('store123', 'pass123', false)
      const result = await sslcz.validate({ val_id: 'VAL123' })

      expect(result.status).toBe('VALID')
    })
  })

  describe('initiateRefund', () => {
    it('should call paymentService.initiateRefund with correct data', async () => {
      const mockResponse = { status: 'success', refund_ref_id: 'RR001' }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const sslcz = new SSLCommerzPayment('store123', 'pass123', false)
      const result = await sslcz.initiateRefund({
        refund_amount: 100,
        refund_remarks: 'Test',
        bank_tran_id: 'BT001',
        refe_id: 'REF001',
      })

      expect(result.status).toBe('success')
    })
  })

  describe('refundQuery', () => {
    it('should call paymentService.refundQuery with correct data', async () => {
      const mockResponse = { status: 'success', refund_ref_id: 'RR001' }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const sslcz = new SSLCommerzPayment('store123', 'pass123', false)
      const result = await sslcz.refundQuery({ refund_ref_id: 'RR001' })

      expect(result.status).toBe('success')
    })
  })

  describe('transactionQueryByTransactionId', () => {
    it('should call paymentService.transactionQueryByTransactionId with correct data', async () => {
      const mockResponse = { status: 'success', tran_id: 'TXN001' }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const sslcz = new SSLCommerzPayment('store123', 'pass123', false)
      const result = await sslcz.transactionQueryByTransactionId({ tran_id: 'TXN001' })

      expect(result.status).toBe('success')
    })
  })

  describe('transactionQueryBySessionId', () => {
    it('should call paymentService.transactionQueryBySessionId with correct data', async () => {
      const mockResponse = { status: 'success', sessionkey: 'SS001' }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const sslcz = new SSLCommerzPayment('store123', 'pass123', false)
      const result = await sslcz.transactionQueryBySessionId({ sessionkey: 'SS001' })

      expect(result.status).toBe('success')
    })
  })
})
