import { PaymentService } from './services'
import { createConfig } from './config'
import type { SSLCommerzConfig } from './types'

export { PaymentService } from './services'
export { createConfig } from './config'
export { transformPaymentInitData, validatePaymentInitData } from './transformers'
export { httpRequest } from './http'
export type { HttpRequestConfig, HttpResponse } from './http'
export {
  SSLCommerzError,
  ValidationError,
  NetworkError,
  APIError,
  ConfigurationError,
} from './errors'
export type {
  PaymentInitData,
  PaymentInitResponse,
  ValidateData,
  ValidateResponse,
  RefundData,
  RefundResponse,
  RefundQueryData,
  RefundQueryResponse,
  TransactionQueryByTransactionIdData,
  TransactionQueryBySessionIdData,
  TransactionQueryResponse,
  SSLCommerzConfig,
} from './types'

export class SSLCommerzPayment {
  private readonly paymentService: PaymentService

  constructor(storeId: string, storePassword: string, isLive: boolean, configOverrides?: Partial<SSLCommerzConfig>) {
    const config = createConfig(storeId, storePassword, isLive, configOverrides)
    this.paymentService = new PaymentService(config)
  }

  init(data: Parameters<PaymentService['init']>[0]) {
    return this.paymentService.init(data)
  }

  validate(data: Parameters<PaymentService['validate']>[0]) {
    return this.paymentService.validate(data)
  }

  initiateRefund(data: Parameters<PaymentService['initiateRefund']>[0]) {
    return this.paymentService.initiateRefund(data)
  }

  refundQuery(data: Parameters<PaymentService['refundQuery']>[0]) {
    return this.paymentService.refundQuery(data)
  }

  transactionQueryByTransactionId(data: Parameters<PaymentService['transactionQueryByTransactionId']>[0]) {
    return this.paymentService.transactionQueryByTransactionId(data)
  }

  transactionQueryBySessionId(data: Parameters<PaymentService['transactionQueryBySessionId']>[0]) {
    return this.paymentService.transactionQueryBySessionId(data)
  }
}

export default SSLCommerzPayment
