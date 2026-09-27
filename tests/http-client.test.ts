import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { httpRequest } from '../src/http/http-client'
import { NetworkError } from '../src/errors'

describe('http-client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should make a GET request and return parsed JSON', async () => {
    const mockData = { status: 'success' }
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockData),
    } as Response)

    const result = await httpRequest({ url: 'https://api.example.com/test', method: 'GET' })

    expect(result.data).toEqual(mockData)
    expect(result.status).toBe(200)
  })

  it('should make a POST request with FormData body', async () => {
    const mockData = { status: 'created' }
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 201,
      statusText: 'Created',
      json: () => Promise.resolve(mockData),
    } as Response)

    const result = await httpRequest({
      url: 'https://api.example.com/test',
      method: 'POST',
      data: { key: 'value', num: 42 },
    })

    expect(result.status).toBe(201)
    const [url, options] = vi.mocked(fetch).mock.calls[0]
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)
  })

  it('should append query params to URL for GET requests', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
    } as Response)

    await httpRequest({
      url: 'https://api.example.com/test',
      method: 'GET',
      params: { foo: 'bar', page: 1 },
    })

    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string
    expect(calledUrl).toContain('foo=bar')
    expect(calledUrl).toContain('page=1')
  })

  it('should use & separator when URL already has query params', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
    } as Response)

    await httpRequest({
      url: 'https://api.example.com/test?existing=true',
      method: 'GET',
      params: { foo: 'bar' },
    })

    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string
    expect(calledUrl).toContain('existing=true')
    expect(calledUrl).toContain('&foo=bar')
  })

  it('should throw NetworkError when response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    } as Response)

    await expect(httpRequest({ url: 'https://api.example.com/test', method: 'GET' })).rejects.toThrow(NetworkError)
  })

  it('should throw NetworkError with status code when response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({}),
    } as Response)

    try {
      await httpRequest({ url: 'https://api.example.com/test', method: 'GET' })
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(NetworkError)
      expect((error as NetworkError).statusCode).toBe(404)
    }
  })

  it('should throw NetworkError when fetch throws', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Connection refused'))

    await expect(httpRequest({ url: 'https://api.example.com/test', method: 'GET' })).rejects.toThrow(NetworkError)
  })

  it('should throw NetworkError on timeout', async () => {
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((_, reject) => {
          const error = new Error('The operation was aborted')
          error.name = 'AbortError'
          reject(error)
        }),
    )

    await expect(
      httpRequest({ url: 'https://api.example.com/test', method: 'GET', timeout: 100 }),
    ).rejects.toThrow('Request timed out')
  })

  it('should skip undefined values in data', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
    } as Response)

    await httpRequest({
      url: 'https://api.example.com/test',
      method: 'POST',
      data: { key: 'value', empty: undefined },
    })

    const [, options] = vi.mocked(fetch).mock.calls[0]
    const formData = options.body as FormData
    expect(formData.get('key')).toBe('value')
    expect(formData.has('empty')).toBe(false)
  })

  it('should skip undefined values in params', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
    } as Response)

    await httpRequest({
      url: 'https://api.example.com/test',
      method: 'GET',
      params: { key: 'value', empty: undefined },
    })

    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string
    expect(calledUrl).toContain('key=value')
    expect(calledUrl).not.toContain('empty=')
  })
})
