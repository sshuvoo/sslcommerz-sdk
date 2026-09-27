import type { SSLCommerzConfig } from '../types'
import { ConfigurationError } from '../errors'

const SANDBOX_BASE_URL = 'https://sandbox.sslcommerz.com'
const LIVE_BASE_URL = 'https://securepay.sslcommerz.com'

export function createConfig(
  storeId: string,
  storePassword: string,
  isLive: boolean,
  overrides?: Partial<SSLCommerzConfig>,
): SSLCommerzConfig {
  if (!storeId || storeId.trim() === '') {
    throw new ConfigurationError('Store ID is required')
  }
  if (!storePassword || storePassword.trim() === '') {
    throw new ConfigurationError('Store password is required')
  }

  const base = isLive ? LIVE_BASE_URL : SANDBOX_BASE_URL

  return {
    storeId: storeId.trim(),
    storePassword: storePassword.trim(),
    isLive,
    baseUrl: overrides?.baseUrl ?? base,
    initUrl: overrides?.initUrl ?? `${base}/gwprocess/v4/api.php`,
    validationUrl: overrides?.validationUrl ?? `${base}/validator/api/validationserverAPI.php`,
    refundUrl: overrides?.refundUrl ?? `${base}/validator/api/merchantTransIDvalidationAPI.php`,
    refundQueryUrl: overrides?.refundQueryUrl ?? `${base}/validator/api/merchantTransIDvalidationAPI.php`,
    transactionQueryBySessionIdUrl:
      overrides?.transactionQueryBySessionIdUrl ?? `${base}/validator/api/merchantTransIDvalidationAPI.php`,
    transactionQueryByTransactionIdUrl:
      overrides?.transactionQueryByTransactionIdUrl ?? `${base}/validator/api/merchantTransIDvalidationAPI.php`,
    timeout: overrides?.timeout ?? 30000,
    headers: overrides?.headers ?? {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
  }
}
