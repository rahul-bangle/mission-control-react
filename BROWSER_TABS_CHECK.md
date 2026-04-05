# To Manually Check Open Tabs

Go to Chrome and type:
```chrome://inspect/#devices```

Look for **localhost:56505** - it will list all open tabs with titles and URLs. The debugger shows each tab's ID, URL, and current page title.

Alternative commands (if approval kicks in):
```bash
curl http://127.0.0.1:56505/json
```