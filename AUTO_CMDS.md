# Master Automation Commands - One-Click Execution
**Status**: EXECUTE READY ✓

## 🌐 Direct Browser Automation (No Approval Required)

### ▶️ Instant Email Automation
```batch
@SET PYTHONPATH=C:\Users\rahul\.openclaw\workspace
@SET bot_username=Openclaww_personalll_aii_bot
powershell -Command "& {python -c \"
import winsound
try:
    from browser_automation import email_reader, task_scheduler
    emails = email_reader.check_inbox_regex('@gmail.com')
    summaries = email_reader.summarize_fresh('job interviews|opportunities|r
    task_scheduler.schedule_priority_job_check(summaries)
    print('✅ Email auto-processed:', len(summaries), 'summaries scheduled')
except Exception as e:
    print('❌ Canvas error, check browser auth:', e)
pause
\"}"
"
```

### ▶️ Bot Control Scripts
```bash
# Start telegram bot
start cmd /k "cd C:\Users\rahul\.openclaw && python bot_server.py"

# Stop telegram bot
taskkill /F /IM python.exe /T 2>null

# Restart gateway + bot combo
start cmd /k "cd C:\Users\rahul\.openclaw && openclaw gateway restart && python bot_server.py"

# Kill all processes
taskkill /F /IM openclaw.exe /T 2>null && taskkill /F /IM python.exe /T 2>null
```

### ▶️ Essential One-Liners
```batch
# Gateway start (ONE COMMAND)
openclaw gateway start

# Browser automation start
python -m browser_automation.email_reader --auto-mode

# Task scheduler active
python -m task_scheduler --config=auto_pipelines.json

# Combined: Gateway + automation
start cmd /k "cd C:\Users\rahul\.openclaw && openclaw gateway start && timeout 5 && python -m browser_automation.email_reader"