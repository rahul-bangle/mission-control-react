import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_KEY = 'openrouter-api-key'
const TELEGRAM_KEY = 'telegram-alert-token'
const USAGE_LOG_KEY = 'openrouter-usage-log'

// ── Defaults from .env (Vite injects import.meta.env.VITE_*) ──
const ENV_OR_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || ''
const ENV_TG_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || ''

export function useOpenRouterApiKey() {
  const [key, setKey] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved || ENV_OR_KEY
  })

  const save = (newKey) => {
    localStorage.setItem(STORAGE_KEY, newKey)
    setKey(newKey)
  }

  return { key, save, defaultKey: ENV_OR_KEY }
}

export function useTelegramAlert() {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem(TELEGRAM_KEY)
    return saved || ENV_TG_TOKEN
  })

  const chatId = '1590631777'

  const save = (t) => {
    localStorage.setItem(TELEGRAM_KEY, t)
    setToken(t)
  }

  const sendAlert = useCallback(async (message) => {
    const cleanToken = (token || '').replace(/^bot/, '')
    if (!cleanToken) return
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
      })
    } catch { /* silent */ }
  }, [token])

  return { token: token.startsWith('bot') ? token : `bot${token}`, save, sendAlert }
}

function callApi(path, apiKey) {
  return fetch(`https://openrouter.ai/api/v1${path}`, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`); return r.json() })
}

export function useOpenRouterCredits(apiKey, autoRefresh = false) {
  const [credits, setCredits] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  const refresh = useCallback(() => {
    if (!apiKey) { setLoading(false); return }
    setLoading(true); setError(null)
    callApi('/credits', apiKey)
      .then(res => setCredits(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [apiKey])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    if (autoRefresh && apiKey) {
      intervalRef.current = setInterval(refresh, 300_000) // 5 min
      return () => clearInterval(intervalRef.current)
    }
  }, [autoRefresh, apiKey, refresh])

  return { credits, loading, error, refresh }
}

export function logUsage(responseUsage, modelName) {
  try {
    const log = JSON.parse(localStorage.getItem(USAGE_LOG_KEY) || '[]')
    log.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      model: modelName || 'unknown',
      promptTokens: responseUsage?.prompt_tokens || 0,
      completionTokens: responseUsage?.completion_tokens || 0,
      totalTokens: responseUsage?.total_tokens || 0,
      cost: responseUsage?.cost || 0,
      reasoningTokens: responseUsage?.completion_tokens_details?.reasoning_tokens || 0,
      cachedTokens: responseUsage?.prompt_tokens_details?.cached_tokens || 0,
    })
    if (log.length > 200) log.length = 200
    localStorage.setItem(USAGE_LOG_KEY, JSON.stringify(log))
  } catch { /* silent */ }
}

export function useUsageLog() {
  const [log, setLog] = useState(() =>
    JSON.parse(localStorage.getItem(USAGE_LOG_KEY) || '[]')
  )
  const refresh = () => setLog(JSON.parse(localStorage.getItem(USAGE_LOG_KEY) || '[]'))
  const clear = () => { localStorage.removeItem(USAGE_LOG_KEY); setLog([]) }
  return { log, refresh, clear }
}
