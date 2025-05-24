export class ApiServerClient {
  public baseUrl: string
  public token: string | undefined

  constructor(baseUrl: string, token?: string) {
    this.baseUrl = baseUrl
    this.token = token
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      ...(options.headers || {}),
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      'Content-Type': 'application/json',
    }
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  get<T>(path: string) {
    return this.request<T>(path)
  }

  post<T>(path: string, body: any) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) })
  }

  put<T>(path: string, body: any) {
    return this.request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' })
  }

  patch<T>(path: string, body: any) {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
  }
  
  
}
