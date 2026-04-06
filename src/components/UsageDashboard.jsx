import { useState } from 'react'
import { useTheme } from '../ThemeContext'
import { useOpenRouterApiKey, useTelegramAlert, useOpenRouterCredits, useUsageLog } from '../hooks/useOpenRouter'

export default function UsageDashboard() {
  const { isLight } = useTheme()
  const { key: apiKey, save: saveApiKey, defaultKey } = useOpenRouterApiKey()
  const { token: tgToken, save: saveTelegram, sendAlert } = useTelegramAlert()
  const { credits, loading, error, refresh } = useOpenRouterCredits(apiKey, true)
  const { log, refresh: refreshLog, clear: clearLog } = useUsageLog()
  const [keyInput, setKeyInput] = useState('')
  const [tgInput, setTgInput] = useState('')
  const [threshold] = useState(80)
  const accent = isLight ? '#007AFF' : 'var(--accent)'
  const primaryBtn = isLight ? { background: '#007AFF', color: '#fff', fontWeight: 600 } : { background: accent, color: '#000' }

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

  const inputCls = "w-full px-3 py-2 text-[10px] rounded-lg"
  const inputStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>OPENROUTER USAGE</h1>
          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Track credits, costs & set budget alerts</p>
        </div>
        <button onClick={refresh} className="px-4 py-2 text-[10px] rounded-lg"
          style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>↻ REFRESH</button>
      </div>

      {/* API Key Input */}
      <div className="p-4 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
        <h3 className="text-[11px] font-bold mb-3" style={{ color: 'var(--text-primary)' }}>🔑 API CONFIG</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>OpenRouter Key</label>
            <input type="password" value={keyInput} onChange={e => setKeyInput(e.target.value)}
              placeholder="sk-or-v1-..." className={inputCls} style={inputStyle} />
          </div>
          <button onClick={() => saveApiKey(keyInput)} className="px-4 py-2 text-[10px] rounded-lg font-medium transition-all" style={primaryBtn}>SAVE</button>
        </div>
        <div className="flex gap-3 items-end mt-3">
          <div className="flex-1">
            <label className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>Telegram Bot Token</label>
            <input type="password" value={tgInput} onChange={e => setTgInput(e.target.value)}
              placeholder="bot123456:ABC..." className={inputCls} style={inputStyle} />
          </div>
          <button onClick={() => saveTelegram(tgInput)} className="px-4 py-2 text-[10px] rounded-lg transition-all" style={{ background: 'var(--color-done)', color: isLight ? '#fff' : '#000' }}>SAVE</button>
          <button onClick={handleTestAlert} className="px-4 py-2 text-[10px] rounded-lg transition-all"
            style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>📤 TEST</button>
        </div>
      </div>

      {!apiKey && (
        <div className="p-6 rounded-lg text-center" style={{ background: 'var(--color-high-bg)', border: '1px solid var(--color-high)40' }}>
          <p className="text-[11px]" style={{ color: 'var(--color-high)' }}>⚠️ Enter your OpenRouter Management API key above</p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg" style={{ background: 'var(--color-urgent-bg)', border: '1px solid var(--color-urgent)40' }}>
          <span className="text-[10px]" style={{ color: 'var(--color-urgent)' }}>❌ {error}</span>
        </div>
      )}

      {overThreshold && credits && (
        <div className="p-4 rounded-lg flex items-center gap-3" style={{ background: 'var(--color-urgent-bg)', border: '1px solid var(--color-urgent)60' }}>
          <span className="text-[18px]">🚨</span>
          <div>
            <p className="text-[11px] font-bold" style={{ color: 'var(--color-urgent)' }}>BUDGET WARNING — {pct}% USED</p>
            <p className="text-[10px]" style={{ color: 'var(--color-high)' }}>${remaining.toFixed(2)} credits remaining</p>
          </div>
        </div>
      )}

      {/* Credits Overview */}
      {credits && (
        <>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'TOTAL CREDITS', value: `$${credits.total_credits.toFixed(2)}`, color: accent },
              { label: 'USED', value: `$${credits.total_usage.toFixed(2)}`, color: 'var(--color-high)' },
              { label: 'REMAINING', value: `$${remaining.toFixed(2)}`, color: overThreshold ? 'var(--color-urgent)' : 'var(--color-done)' },
              { label: 'USED %', value: `${pct}%`, color: overThreshold ? 'var(--color-urgent)' : accent },
            ].map(card => (
              <div key={card.label} className="p-4 rounded-lg text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                <div className="text-[14px] font-bold" style={{ color: card.color }}>{card.value}</div>
                <div className="text-[8px] mt-2" style={{ color: 'var(--text-tertiary)' }}>{card.label}</div>
              </div>
            ))}
            <div className="col-span-4 p-4 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>CREDIT USAGE</span>
                <span className="text-[10px]" style={{ color: pct > 80 ? 'var(--color-urgent)' : pct > 50 ? 'var(--color-high)' : 'var(--color-done)' }}>{pct}%</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-progress-bg)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{
                  width: `${Math.min(pct, 100)}%`,
                  background: pct > 80 ? 'var(--color-urgent)' : pct > 50 ? 'var(--color-high)' : accent
                }} />
              </div>
            </div>
          </div>
          {/* Model Breakdown */}
          {Object.keys(byModel).length > 0 && (
            <div className="p-4 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
              <h3 className="text-[11px] font-bold mb-3" style={{ color: 'var(--text-primary)' }}>📊 MODEL BREAKDOWN</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border-default)' }}>
                      {['MODEL', 'CALLS', 'TOKENS', 'COST', 'AVG $/CALL'].map(h => (
                        <th key={h} className="py-2 text-left pr-4" style={{ color: 'var(--text-tertiary)', fontWeight: 'normal' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(byModel).map(([model, data]) => (
                      <tr key={model} className="border-b" style={{ borderColor: 'var(--border-default)' }}>
                        <td className="py-2 pr-4" style={{ color: accent }}>{model}</td>
                        <td className="py-2 pr-4" style={{ color: 'var(--text-primary)' }}>{data.calls}</td>
                        <td className="py-2 pr-4" style={{ color: 'var(--text-secondary)' }}>{(data.tokens / 1000).toFixed(1)}k</td>
                        <td className="py-2 pr-4" style={{ color: 'var(--color-high)' }}>${data.cost.toFixed(4)}</td>
                        <td style={{ color: 'var(--text-tertiary)' }}>${(data.cost / data.calls).toFixed(5)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-2 pr-4 font-bold" style={{ color: 'var(--text-primary)' }}>TOTAL</td>
                      <td className="py-2 pr-4" style={{ color: 'var(--text-primary)' }}>{log.length}</td>
                      <td className="py-2 pr-4" style={{ color: 'var(--text-secondary)' }}>{(totalTokens / 1000).toFixed(1)}k</td>
                      <td style={{ color: 'var(--color-high)' }}>${totalCost.toFixed(4)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Call History */}
      <div className="p-4 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>📋 CALL HISTORY ({log.length})</h3>
          <button onClick={clearLog} className="px-3 py-1 text-[9px] rounded-lg" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>CLEAR LOG</button>
        </div>
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {log.length === 0 && <p className="text-[10px] py-4 text-center" style={{ color: 'var(--text-tertiary)' }}>No calls logged yet.</p>}
          {log.slice(0, 30).map(entry => (
            <div key={entry.id} className="flex items-center justify-between px-3 py-2 rounded" style={{ background: 'var(--bg-surface)' }}>
              <div className="flex items-center gap-4">
                <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                <span className="text-[10px]" style={{ color: accent }}>{entry.model}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{entry.totalTokens} tok</span>
                {entry.reasoningTokens > 0 && <span className="text-[9px]" style={{ color: 'var(--color-review)' }}>🧠 {entry.reasoningTokens}</span>}
                {entry.cachedTokens > 0 && <span className="text-[9px]" style={{ color: 'var(--color-done)' }}>⚡ cached</span>}
                <span className="text-[10px]" style={{ color: 'var(--color-high)' }}>${entry.cost.toFixed(4)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Settings */}
      <div className="p-4 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
        <h3 className="text-[11px] font-bold mb-3" style={{ color: 'var(--text-primary)' }}>🔔 ALERT SETTINGS</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Warning threshold:</span>
            <span className="text-[12px] font-bold" style={{ color: overThreshold ? 'var(--color-urgent)' : 'var(--color-high)' }}>{threshold}%</span>
            {overThreshold && <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--color-urgent-bg)', color: 'var(--color-urgent)' }}>BREACHED</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Telegram:</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tgToken ? 'bg-[var(--color-done-bg)] text-[var(--color-done)]' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}>
              {tgToken ? '✅ ON' : '❌ OFF'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
