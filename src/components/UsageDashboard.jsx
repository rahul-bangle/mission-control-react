import { useState } from 'react'
import { useOpenRouterApiKey, useTelegramAlert, useOpenRouterCredits, useUsageLog } from '../hooks/useOpenRouter'

export default function UsageDashboard() {
  const { key: apiKey, save: saveApiKey, defaultKey } = useOpenRouterApiKey()
  const { token: tgToken, save: saveTelegram, sendAlert } = useTelegramAlert()
  const { credits, loading, error, refresh } = useOpenRouterCredits(apiKey, true)
  const { log, refresh: refreshLog, clear: clearLog } = useUsageLog()
  const [keyInput, setKeyInput] = useState('')
  const [tgInput, setTgInput] = useState('')
  const [threshold] = useState(80)
  const fromEnv = !!defaultKey || !!import.meta.env.VITE_OPENROUTER_API_KEY
  const tgFromEnv = !!import.meta.env.VITE_TELEGRAM_BOT_TOKEN

  const remaining = credits ? Math.max(0, credits.total_credits - credits.total_usage) : 0
  const pct = credits ? Math.round((credits.total_usage / credits.total_credits) * 100) : 0
  const overThreshold = pct >= threshold

  const totalCost = log.reduce((s, e) => s + e.cost, 0)
  const totalTokens = log.reduce((s, e) => s + e.totalTokens, 0)
  const byModel = {};
  log.forEach(e => {
    if (!byModel[e.model]) byModel[e.model] = { calls: 0, tokens: 0, cost: 0 }
    byModel[e.model].calls++
    byModel[e.model].tokens += e.totalTokens
    byModel[e.model].cost += e.cost
  })

  const handleTestAlert = () => sendAlert('🦞 <b>Mission Control</b>\nOpenRouter alert test — all systems go!')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-bold text-white font-mono tracking-wider">OPENROUTER USAGE</h1>
          <p className="text-[10px] font-mono" style={{ color: '#666' }}>Track credits, costs & set budget alerts</p>
        </div>
        <button onClick={refresh} className="px-4 py-2 text-[10px] font-mono rounded" style={{ background: '#19c3ff20', color: '#19c3ff', border: '1px solid #19c3ff40' }}>
          ↻ REFRESH
        </button>
      </div>

      {/* API Key Input */}
      <div className="p-4 rounded-lg" style={{ background: '#111111', border: '1px solid #1a1a1a' }}>
        <h3 className="text-[11px] font-bold text-white font-mono mb-3">🔑 API CONFIG</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-[9px] font-mono" style={{ color: '#666' }}>OpenRouter Key (Management key for credits)</label>
            <input type="password" value={keyInput} onChange={e => setKeyInput(e.target.value)}
              placeholder="sk-or-v1-..." className="w-full px-3 py-2 text-[10px] font-mono mt-1 rounded" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', outline: 'none' }} />
          </div>
          <button onClick={() => saveApiKey(keyInput)} className="px-4 py-2 text-[10px] font-mono rounded font-bold" style={{ background: '#19c3ff', color: '#000' }}>SAVE KEY</button>
        </div>
        <div className="flex gap-3 items-end mt-3">
          <div className="flex-1">
            <label className="text-[9px] font-mono" style={{ color: '#666' }}>Telegram Bot Token (for alerts)</label>
            <input type="password" value={tgInput} onChange={e => setTgInput(e.target.value)}
              placeholder="bot123456:ABC..." className="w-full px-3 py-2 text-[10px] font-mono mt-1 rounded" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', outline: 'none' }} />
          </div>
          <button onClick={() => saveTelegram(tgInput)} className="px-4 py-2 text-[10px] font-mono rounded font-bold" style={{ background: '#22c55e', color: '#000' }}>SAVE</button>
          <button onClick={handleTestAlert} className="px-4 py-2 text-[10px] font-mono rounded" style={{ background: '#a855f720', color: '#a855f7', border: '1px solid #a855f740' }}>📤 TEST</button>
        </div>
      </div>

      {!apiKey && (
        <div className="p-6 rounded-lg text-center" style={{ background: '#1a0a00', border: '1px solid #f59e0b40' }}>
          <p className="text-[11px] font-mono" style={{ color: '#f59e0b' }}>⚠️ Enter your OpenRouter Management API key above to fetch credit data</p>
          <p className="text-[10px] font-mono mt-1" style={{ color: '#666' }}>Get it from: openrouter.ai/settings/keys → create Management key</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg" style={{ background: '#1a0a0a', border: '1px solid #ef444440' }}>
          <span className="text-[10px] font-mono" style={{ color: '#ef4444' }}>❌ {error}</span>
        </div>
      )}

      {/* Budget Warning */}
      {overThreshold && credits && (
        <div className="p-4 rounded-lg flex items-center gap-3" style={{ background: '#1a0a0a', border: '1px solid #ef444460', animation: 'pulse-red 2s infinite' }}>
          <span className="text-[18px]">🚨</span>
          <div>
            <p className="text-[11px] font-mono font-bold" style={{ color: '#ef4444' }}>BUDGET WARNING — {pct}% USED</p>
            <p className="text-[10px] font-mono" style={{ color: '#f59e0b' }}>{remaining.toFixed(2)} credits remaining of {credits.total_credits.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Credits Overview */}
      {credits && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'TOTAL CREDITS', value: `$${credits.total_credits.toFixed(2)}`, color: '#19c3ff' },
            { label: 'USED', value: `$${credits.total_usage.toFixed(2)}`, color: '#f59e0b' },
            { label: 'REMAINING', value: `$${remaining.toFixed(2)}`, color: overThreshold ? '#ef4444' : '#22c55e' },
            { label: 'USED %', value: `${pct}%`, color: overThreshold ? '#ef4444' : '#19c3ff' },
          ].map(card => (
            <div key={card.label} className="p-4 rounded-lg text-center" style={{ background: '#111111', border: '1px solid #1a1a1a' }}>
              <div className="text-[14px] font-bold font-mono" style={{ color: card.color }}>{card.value}</div>
              <div className="text-[8px] font-mono mt-2" style={{ color: '#555' }}>{card.label}</div>
            </div>
          ))}

          {/* Progress Bar */}
          <div className="col-span-4 p-4 rounded-lg" style={{ background: '#111111', border: '1px solid #1a1a1a' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono" style={{ color: '#666' }}>CREDIT USAGE</span>
              <span className="text-[10px] font-mono" style={{ color: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#22c55e' }}>{pct}%</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{
                width: `${Math.min(pct, 100)}%`,
                background: pct > 80 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : pct > 50 ? 'linear-gradient(90deg, #19c3ff, #f59e0b)' : 'linear-gradient(90deg, #22c55e, #19c3ff)'
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Model Breakdown */}
      {Object.keys(byModel).length > 0 && (
        <div className="p-4 rounded-lg" style={{ background: '#111111', border: '1px solid #1a1a1a' }}>
          <h3 className="text-[11px] font-bold text-white font-mono mb-3">📊 MODEL BREAKDOWN</h3>
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="border-b" style={{ borderColor: '#1a1a1a' }}>
                {['MODEL', 'CALLS', 'TOKENS', 'COST', 'AVG $/CALL'].map(h => (
                  <th key={h} className="py-2 text-left pr-4" style={{ color: '#555', fontWeight: 'normal' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(byModel).map(([model, data]) => (
                <tr key={model} className="border-b" style={{ borderColor: '#1a1a1a' }}>
                  <td className="py-2 pr-4 text-[#19c3ff]">{model}</td>
                  <td className="py-2 pr-4 text-white">{data.calls}</td>
                  <td className="py-2 pr-4" style={{ color: '#888' }}>{(data.tokens / 1000).toFixed(1)}k</td>
                  <td className="py-2 pr-4" style={{ color: '#f59e0b' }}>${data.cost.toFixed(4)}</td>
                  <td className="py-2" style={{ color: '#666' }}>${(data.cost / data.calls).toFixed(5)}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2 pr-4 font-bold text-white">TOTAL</td>
                <td className="py-2 pr-4 text-white">{log.length}</td>
                <td className="py-2 pr-4" style={{ color: '#888' }}>{(totalTokens / 1000).toFixed(1)}k</td>
                <td className="py-2" style={{ color: '#f59e0b' }}>${totalCost.toFixed(4)}</td>
                <td className="py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Call History */}
      <div className="p-4 rounded-lg" style={{ background: '#111111', border: '1px solid #1a1a1a' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-bold text-white font-mono">📋 CALL HISTORY ({log.length})</h3>
          <button onClick={clearLog} className="px-3 py-1 text-[9px] font-mono rounded" style={{ background: '#252525', color: '#888' }}>CLEAR LOG</button>
        </div>
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {log.length === 0 && <p className="text-[10px] font-mono text-[#555] py-4 text-center">No calls logged yet. Make an API call to see it here.</p>}
          {log.slice(0, 30).map(entry => (
            <div key={entry.id} className="flex items-center justify-between px-3 py-2 rounded" style={{ background: '#1a1a1a' }}>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-mono" style={{ color: '#555' }}>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                <span className="text-[10px] font-mono text-[#19c3ff]">{entry.model}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-mono" style={{ color: '#888' }}>{entry.totalTokens} tok</span>
                {entry.reasoningTokens > 0 && <span className="text-[9px] font-mono" style={{ color: '#a855f7' }}>🧠 {entry.reasoningTokens}</span>}
                {entry.cachedTokens > 0 && <span className="text-[9px] font-mono" style={{ color: '#22c55e' }}>⚡ cached</span>}
                <span className="text-[10px] font-mono" style={{ color: '#f59e0b' }}>${entry.cost.toFixed(4)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Alert Settings */}
      <div className="p-4 rounded-lg" style={{ background: '#111111', border: '1px solid #1a1a1a' }}>
        <h3 className="text-[11px] font-bold text-white font-mono mb-3">🔔 ALERT SETTINGS</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono" style={{ color: '#666' }}>Warning threshold:</span>
            <span className="text-[12px] font-bold font-mono" style={{ color: overThreshold ? '#ef4444' : '#f59e0b' }}>{threshold}%</span>
            {overThreshold && <span className="text-[9px] px-2 py-0.5 rounded font-bold" style={{ background: '#ef444420', color: '#ef4444' }}>BREACHED</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono" style={{ color: '#666' }}>Telegram alerts:</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${tgToken ? 'bg-[#22c55e20] text-[#22c55e]' : 'bg-[#555] text-[#888]'}`}>
              {tgToken ? '✅ ENABLED' : '❌ DISABLED'}
            </span>
          </div>
          <button onClick={refresh} className="px-3 py-1.5 text-[9px] font-mono rounded" style={{ background: '#19c3ff20', color: '#19c3ff', border: '1px solid #19c3ff40' }}>
            🔄 Check Now
          </button>
        </div>
      </div>
    </div>
  )
}
