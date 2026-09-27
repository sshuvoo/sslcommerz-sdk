import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PaymentService } from '../src/services/payment-service'
import { createConfig } from '../src/config/sslcommerz-config'
import { ValidationError, NetworkError } from '../src/errors'

describe('PaymentService', () => {
  let service: PaymentService
  const storeId = 'test_store'
  const storePassword = 'test_pass'

  beforeEach(() => {
    const config = createConfig(storeId, storePassword, false)
    service = new PaymentService(config)
  })

  describe('init', () => {
    it('should throw ValidationError when required fields are missing', async () => {
      const invalidData = { total_amount: 100 } as any
      await expect(service.init(invalidData)).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when total_amount is 0 or negative', async () => {
      const data = {
        store_id: storeId,
        store_passwd: storePassword,
        productcategory: 'test',
        tran_id: 'TXN001',
        total_amount: 0,
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
      await expect(service.init(data)).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when email is invalid', async () => {
      const data = {
        store_id: storeId,
        store_passwd: storePassword,
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
        cus_email: 'invalid-email',
        cus_add1: 'Dhaka',
        cus_city: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
      }
      await expect(service.init(data)).rejects.toThrow(ValidationError)
    })

    it('should make POST request to init URL with correct data', async () => {
      const mockResponse = {
        status: 'SUCCESS',
        GatewayPageURL: 'https://sandbox.sslcommerz.com/gateway/test',
        failedreason: '',
      }

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse),
      })
      vi.stubGlobal('fetch', fetchMock)

      const data = {
        store_id: storeId,
        store_passwd: storePassword,
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

      const result = await service.init(data)

      expect(fetchMock).toHaveBeenCalledWith(
        'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
        expect.objectContaining({ method: 'POST' }),
      )
      expect(result.status).toBe('SUCCESS')
      expect(result.GatewayPageURL).toBe('https://sandbox.sslcommerz.com/gateway/test')

      vi.unstubAllGlobals()
    })
  })

  describe('validate', () => {
    it('should throw ValidationError when val_id is missing', async () => {
      await expect(service.validate({ val_id: '' })).rejects.toThrow(ValidationError)
    })

    it('should make GET request to validation URL with correct params', async () => {
      const mockResponse = { status: 'VALID', tran_id: 'TXN001' }

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse),
      })
      vi.stubGlobal('fetch', fetchMock)

      const result = await service.validate({ val_id: 'VAL123' })

      const calledUrl = fetchMock.mock.calls[0][0] as string
      expect(calledUrl).toContain('validationserverAPI.php')
      expect(calledUrl).toContain('val_id=VAL123')
      expect(calledUrl).toContain(`store_id=${storeId}`)
      expect(result.status).toBe('VALID')

      vi.unstubAllGlobals()
    })
  })

  describe('initiateRefund', () => {
    it('should throw ValidationError when bank_tran_id is missing', async () => {
      await expect(
        service.initiateRefund({
          refund_amount: 100,
          refund_remarks: 'Test',
          bank_tran_id: '',
          refe_id: 'REF001',
        }),
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when refund_amount is 0 or negative', async () => {
      await expect(
        service.initiateRefund({
          refund_amount: 0,
          refund_remarks: 'Test',
          bank_tran_id: 'BT001',
          refe_id: 'REF001',
        }),
      ).rejects.toThrow(ValidationError)
    })

    it('should make GET request to refund URL with correct params', async () => {
      const mockResponse = { status: 'success', refund_ref_id: 'RR001' }

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse),
      })
      vi.stubGlobal('fetch', fetchMock)

      const result = await service.initiateRefund({
        refund_amount: 100,
        refund_remarks: 'Test refund',
        bank_tran_id: 'BT001',
        refe_id: 'REF001',
      })

      const calledUrl = fetchMock.mock.calls[0][0] as string
      expect(calledUrl).toContain('merchantTransIDvalidationAPI.php')
      expect(calledUrl).toContain('bank_tran_id=BT001')
      expect(calledUrl).toContain('refe_id=REF001')
      expect(result.status).toBe('success')

      vi.unstubAllGlobals()
    })
  })

  describe('refundQuery', () => {
    it('should throw ValidationError when refund_ref_id is missing', async () => {
      await expect(service.refundQuery({ refund_ref_id: '' })).rejects.toThrow(ValidationError)
    })

    it('should make GET request with correct params', async () => {
      const mockResponse = { status: 'success', refund_ref_id: 'RR001' }

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse),
      })
      vi.stubGlobal('fetch', fetchMock)

      const result = await service.refundQuery({ refund_ref_id: 'RR001' })

      const calledUrl = fetchMock.mock.calls[0][0] as string
      expect(calledUrl).toContain('refund_ref_id=RR001')
      expect(result.status).toBe('success')

      vi.unstubAllGlobals()
    })
  })

  describe('transactionQueryByTransactionId', () => {
    it('should throw ValidationError when tran_id is missing', async () => {
      await expect(service.transactionQueryByTransactionId({ tran_id: '' })).rejects.toThrow(ValidationError)
    })

    it('should make GET request with correct params', async () => {
      const mockResponse = { status: 'success', tran_id: 'TXN001' }

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse),
      })
      vi.stubGlobal('fetch', fetchMock)

      const result = await service.transactionQueryByTransactionId({ tran_id: 'TXN001' })

      const calledUrl = fetchMock.mock.calls[0][0] as string
      expect(calledUrl).toContain('tran_id=TXN001')
      expect(result.status).toBe('success')

      vi.unstubAllGlobals()
    })
  })

  describe('transactionQueryBySessionId', () => {
    it('should throw ValidationError when sessionkey is missing', async () => {
      await expect(service.transactionQueryBySessionId({ sessionkey: '' })).rejects.toThrow(ValidationError)
    })

    it('should make GET request with correct params', async () => {
      const mockResponse = { status: 'success', sessionkey: 'SS001' }

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponse),
      })
      vi.stubGlobal('fetch', fetchMock)

      const result = await service.transactionQueryBySessionId({ sessionkey: 'SS001' })

      const calledUrl = fetchMock.mock.calls[0][0] as string
      expect(calledUrl).toContain('sessionkey=SS001')
      expect(result.status).toBe('success')

      vi.unstubAllGlobals()
    })
  })
})
