import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import API_BASE_URL from './config'
import './index.css'

const originalFetch = window.fetch.bind(window)
const apiOrigin = new URL(API_BASE_URL).origin

const clearAuthState = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('loginUser')
}

window.fetch = (input, init = {}) => {
  const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url

  if (!requestUrl) {
    return originalFetch(input, init)
  }

  const resolvedUrl = new URL(requestUrl, window.location.origin)
  const isApiRequest = resolvedUrl.origin === apiOrigin

  if (!isApiRequest) {
    return originalFetch(input, init)
  }

  const token = localStorage.getItem('authToken')
  if (!token) {
    return originalFetch(input, init)
  }

  const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined))
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return originalFetch(input, {
    ...init,
    headers,
  }).then((response) => {
    if (response.status === 401) {
      clearAuthState()
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }

    return response
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
