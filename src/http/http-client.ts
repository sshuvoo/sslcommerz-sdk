import { NetworkError, APIError } from '../errors'

export interface HttpRequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: Record<string, string | number | boolean | undefined>
  params?: Record<string, string | number | undefined>
  headers?: Record<string, string>
  timeout?: number
}

export interface HttpResponse<T = unknown> {
  data: T
  status: number
  statusText: string
}

export async function httpRequest<T = unknown>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
  const { url, method, data, params, headers = {}, timeout = 30000 } = config

  let finalUrl = url
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    }
    const queryString = searchParams.toString()
    finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryString
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    }

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      const formData = new FormData()
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          formData.append(key, String(value))
        }
      }
      fetchOptions.body = formData
    }

    const response = await fetch(finalUrl, fetchOptions)
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`, response.status)
    }

    const responseData = (await response.json()) as T
    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
    }
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof NetworkError) {
      throw error
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new NetworkError(`Request timed out after ${timeout}ms`)
    }

    if (error instanceof Error) {
      throw new NetworkError(error.message)
    }

    throw new NetworkError('An unknown error occurred during the request')
  }
}
