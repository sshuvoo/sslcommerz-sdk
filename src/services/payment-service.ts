import type {
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
} from '../types'
import { httpRequest } from '../http'
import { transformPaymentInitData, validatePaymentInitData } from '../transformers'
import { ValidationError } from '../errors'

export class PaymentService {
  private readonly config: SSLCommerzConfig

  constructor(config: SSLCommerzConfig) {
    this.config = config
  }

  async init(data: PaymentInitData): Promise<PaymentInitResponse> {
    validatePaymentInitData(data)

    const transformedData = transformPaymentInitData(data)

    const response = await httpRequest<PaymentInitResponse>({
      url: this.config.initUrl!,
      method: 'POST',
      data: transformedData,
      headers: this.config.headers,
      timeout: this.config.timeout,
    })

    if (response.data.status === 'FAILED') {
      throw new ValidationError(response.data.failedreason || 'Payment initialization failed')
    }

    return response.data
  }

  async validate(data: ValidateData): Promise<ValidateResponse> {
    if (!data.val_id) {
      throw new ValidationError('val_id is required for validation')
    }

    const response = await httpRequest<ValidateResponse>({
      url: this.config.validationUrl!,
      method: 'GET',
      params: {
        val_id: data.val_id,
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword,
        v: 1,
        format: 'json',
      },
      headers: this.config.headers,
      timeout: this.config.timeout,
    })

    return response.data
  }

  async initiateRefund(data: RefundData): Promise<RefundResponse> {
    this.validateRefundData(data)

    const response = await httpRequest<RefundResponse>({
      url: this.config.refundUrl!,
      method: 'GET',
      params: {
        refund_amount: data.refund_amount,
        refund_remarks: data.refund_remarks,
        bank_tran_id: data.bank_tran_id,
        refe_id: data.refe_id,
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword,
        v: 1,
        format: 'json',
      },
      headers: this.config.headers,
      timeout: this.config.timeout,
    })

    return response.data
  }

  async refundQuery(data: RefundQueryData): Promise<RefundQueryResponse> {
    if (!data.refund_ref_id) {
      throw new ValidationError('refund_ref_id is required for refund query')
    }

    const response = await httpRequest<RefundQueryResponse>({
      url: this.config.refundQueryUrl!,
      method: 'GET',
      params: {
        refund_ref_id: data.refund_ref_id,
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword,
        v: 1,
        format: 'json',
      },
      headers: this.config.headers,
      timeout: this.config.timeout,
    })

    return response.data
  }

  async transactionQueryByTransactionId(data: TransactionQueryByTransactionIdData): Promise<TransactionQueryResponse> {
    if (!data.tran_id) {
      throw new ValidationError('tran_id is required for transaction query')
    }

    const response = await httpRequest<TransactionQueryResponse>({
      url: this.config.transactionQueryByTransactionIdUrl!,
      method: 'GET',
      params: {
        tran_id: data.tran_id,
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword,
        v: 1,
        format: 'json',
      },
      headers: this.config.headers,
      timeout: this.config.timeout,
    })

    return response.data
  }

  async transactionQueryBySessionId(data: TransactionQueryBySessionIdData): Promise<TransactionQueryResponse> {
    if (!data.sessionkey) {
      throw new ValidationError('sessionkey is required for transaction query by session')
    }

    const response = await httpRequest<TransactionQueryResponse>({
      url: this.config.transactionQueryBySessionIdUrl!,
      method: 'GET',
      params: {
        sessionkey: data.sessionkey,
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword,
        v: 1,
        format: 'json',
      },
      headers: this.config.headers,
      timeout: this.config.timeout,
    })

    return response.data
  }

  private validateRefundData(data: RefundData): void {
    if (!data.bank_tran_id) {
      throw new ValidationError('bank_tran_id is required for refund')
    }
    if (!data.refe_id) {
      throw new ValidationError('refe_id is required for refund')
    }
    if (data.refund_amount <= 0) {
      throw new ValidationError('refund_amount must be greater than 0')
    }
  }
}
