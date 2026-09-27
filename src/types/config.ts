export interface SSLCommerzConfig {
  storeId: string
  storePassword: string
  isLive: boolean
  baseUrl?: string
  initUrl?: string
  validationUrl?: string
  refundUrl?: string
  refundQueryUrl?: string
  transactionQueryBySessionIdUrl?: string
  transactionQueryByTransactionIdUrl?: string
  timeout?: number
  headers?: Record<string, string>
}
