# MISSION CONTROL — Snitch UI Generation Prompts
## Style: Executive Minimalistic Dark | High-Fidelity | NO Glassmorphism | Clean SaaS Dashboard
## Author: Aria 🦞 | Date: 2026-04-04
## Theme: Dark (#0a0a0a bg) | Accent: Cyan (#19c3ff) | Mono-spaced font

---

## GLOBAL DESIGN SYSTEM (ALL SCREENS)

**Background Colors:**
- Page: `#0a0a0a` (near black)
- Panels/Sidebar: `#111111` 
- Cards/Sections: `#1a1a1a` or `#252525`
- Borders/dividers: `#222222` or `#333333`
- Hover states: `#2a2a2a`

**Text:**
- Primary: `#ffffff` (white)
- Secondary: `#888888` or `#666666` (gray)
- Muted: `#555555`
- Accent: `#19c3ff` (cyan)
- Success: `#22c55e` (green)
- Warning: `#f59e0b` (yellow/orange)
- Error/Danger: `#ef4444` (red)
- Purple: `#a855f7`

**Typography:**
- Font-family: monospace (JetBrains Mono or SF Mono)
- Title: 14px, bold, tracking-widest, cyan
- Headings: 12-16px bold, white
- Body: 12-14px, gray
- Small/metadata: 11px, muted gray

**Spacing & Grid:**
- 4px base scale (4, 8, 12, 16, 20, 24, 32, 40, 48)
- Consistent 8px rhythm

**Component Style:**
- Cards: flat, 1px border `#222222` or `#333333`, NO shadows, NO blur
- Buttons: flat, no gradients, 4px border-radius
- Tags/badges: solid fills, small caps, monospace text
- Table rows: 1px bottom border, hover bg `#1a1a1a`
- Progress bars: thin (4px height), bg `#222222`, fill solid cyan `#19c3ff`
- No glassmorphism, no frosted glass, no blur, no gradients on surfaces

**Overall Feel:**
- Think: Linear's dark mode, Vercel dashboard, GitHub dark, or terminal-inspired SaaS
- Clean, minimal, developer-friendly but executive
- Dense information, good whitespace, scannable
- No illustrations, no decorative elements — functional beauty
---

## SCREEN 1: SIDEBAR (NAVIGATION)

### Variant 1A — Current (Enhanced)
**Prompt:**
A high-fidelity dark-themed sidebar navigation for "Mission Control" app. Width ~240px, background `#111111`. Top-left: Brand "🦞 MISSION CONTROL" in cyan (#19c3ff) 12px bold monospace, tracking-wider, with a small green dot (online indicator). Bottom: User avatar (32px circle, gray placeholder) + username "rahul" in white 12px. Navigation items (7 total): Task Board, Calendar, Projects, Memories, Docs, Team, Office. Each: left icon emoji (8px), label 13px. Active item: background `#252525`, cyan text (#19c3ff), left 2px cyan border. Inactive items: text `#666666`, hover background `#1a1a1a`, white text. Clean dividers between nav groups. Minimal, terminal-inspired, functional.

### Variant 1B — Collapsible with Icons
**Prompt:**
A high-fidelity dark sidebar with two states shown side by side. Left: Expanded state (220px) with full labels + icons. Right: Collapsed state (56px) showing only icons. Background `#111111`. Top: "MC" logo in cyan 14px. Navigation items: 7 icons in vertical list, 20px circles, cyan when active, gray when inactive. Hover: tooltip on right showing label text. Hover effect: subtle `#1a1a1a` background, no glow. Bottom: Settings gear icon in `#333333` with a blue badge dot. Expand/collapse toggle at bottom-right (tiny arrow icon). Clean, minimal, space-efficient. NO blur effects, NO glass morphism.

---

## SCREEN 2: TASK BOARD (Kanban)

### Variant 2A — Classic Kanban
**Prompt:**
A high-fidelity Kanban board on dark background (#0a0a0a). 4 columns: "Backlog", "In Progress", "Review", "Done". Each column: header with 12px white bold text, task count in cyan pill (e.g., "4"), 1px bottom border `#222222`. Cards inside columns: background `#1a1a1a`, 1px border `#333333`, 12px padding, 4px border-radius. Card content: task title white 13px, below: tag (e.g., "feature" in blue, "bug" in red, "improvement" in green), priority indicator (left 3px colored bar: red=urgent, yellow=high, green=low), assignee avatar (16px circle). Drag hover state: dashed cyan border around card slot. Bottom of column: "+ Add task" gray text link. Column widths equal. Overall: clean, dense, functional. Think Linear's kanban but simpler.

### Variant 2B — List View Toggle
**Prompt:**
A high-fidelity task board in list layout on dark background (#0a0a0a). Top bar: "Tasks" title 14px bold white, right side filter dropdowns (Status, Priority, Assignee — outlined `#333333` border, white text). Below: Table with 5 columns (Task Name, Status, Priority, Due Date, Assignee). Header: 11px uppercase `#666666` text with bottom border `#222222`. Each row: 48px height, hover background `#1a1a1a`, 1px bottom divider. Status column: pill tags — "In Progress" (blue), "Done" (green), "Blocked" (red). Priority: dot indicator + text — "P0" red bold, "P1" yellow, "P2" green. Due dates: gray 12px, overdue in red. Assignee: small circle avatar with initials. Top-right: toggle button showing list icon active. Clean data table, no shadows, no glow.

### Variant 2C — Timeline/Gantt
**Prompt:**
A high-fidelity task timeline view on dark background (#0a0a0a). Top: "Task Timeline" title 14px bold white, date range selector "Apr 1 – Apr 30 ⌄" in outlined `#333333` border. Below: Horizontal timeline with dates across top (Mon, Tue, Wed...). Each date column separated by thin `#222222` vertical lines. Tasks shown as horizontal bars spanning multiple date columns — cyan bars for active, green for completed, yellow for at-risk. Task bars: 24px height, 4px border-radius, white text inside (task name). Left side panel: task names listed vertically, aligned with their bars. Right panel: summary stats — "3 overdue", "7 on track", "12 total" in a 3-column bar. NO gradients on bars. Flat design only. Dense but scannable, like a PM's command center.

---

## SCREEN 3: CALENDAR

### Variant 3A — Monthly Grid
**Prompt:**
A high-fidelity monthly calendar on dark background (#0a0a0a). Top: "April 2026" in 16px bold white, left/right arrow buttons (`#333333` background, white chevrons), right: "Today" button outlined. Calendar grid: 7 columns (Mon–Sun), day headers in 11px `#666666` uppercase. Each day cell: 80x80px, `#111111` background, 1px border `#222222`. Day numbers: 13px `#888888`. Today: cyan circle border, white number. Event indicators: small colored dots below day number (cyan=scheduled, green=completed, yellow=TBD). Days with events: show 1-2 event names in 10px text. Right sidebar: "Upcoming Next 7 Days" header, list of event cards — time in cyan 12px, event name white 13px, small icon for type (meeting, deadline, reminder). No glassmorphism. Flat, functional, terminal-calendar feel.

### Variant 3B — Weekly Agenda
**Prompt:**
A high-fidelity weekly agenda calendar view on dark background (#0a0a0a). Left: 7-day strip across top — each day card (100px wide) shows day name (Mon, 12px `#666666`), date number (28px bold white, today in cyan), event count in small cyan pill. Below the strip: a vertical schedule grid — left column shows hours (6 AM to 10 PM, 12px `#666666`), right area is a time grid with 1px `#222222` horizontal lines for each hour. Events rendered as colored blocks: cyan for meetings, green for completed, yellow for deadlines. Each event block: 24px padding, white title text 12px, location/time in `#888888` 10px. Right sidebar: "Quick Add" section with a + button and a mini list of "Today's Tasks" — checkbox style, unchecked items in white, completed in green with strikethrough. Clean, minimal, no effects on event blocks.

### Variant 3C — Compact Dashboard
**Prompt:**
A high-fidelity calendar dashboard blending monthly view with timeline. Dark background (#0a0a0a). Top: "Calendar" title 14px bold white. Layout: 2-column. Left (60%): Mini calendar grid (compact). Right: Upcoming events vertical list. Mini calendar cells: 40x40px, `#111111`, today highlighted cyan. Event dots in cells. Right panel: 5 event cards stacked — each: small colored left border (status color), event title white 14px, date/time cyan 11px, location/notes `#666666` 11px. Bottom section spanning full width: "This Week's Overview" — horizontal bar chart showing busy-ness per day: Mon (3 events, short bar), Tue (5 events, longer bar), etc. Bars in cyan on `#222222` track. Flat design only.

---

## SCREEN 4: PROJECTS

### Variant 4A — Project Cards Grid
**Prompt:**
A high-fidelity projects overview page on dark background (#0a0a0a). Top: "Projects" title 14px bold white, right: "+ New Project" button cyan filled. Below: 3-column grid of project cards. Each card: `#1a1a1a` background, 1px border `#333333`, 16px padding, 4px border-radius. Card header: project name 16px bold white, status pill right (cyan="Active", green="Completed", yellow="Paused"). Below: description 12px `#888888`, 2 lines max. Progress bar: 4px height, `#222222` track, cyan fill, with percentage next to it (e.g., "67%"). Below progress: 3 small stat rows — "Tasks", "Members", "Days Left" — with numbers in white 12px. Bottom: team avatars (16px circles, overlapping slightly). Card hover: `#222222` border, no glow. Clean, scannable, data-dense.

### Variant 4B — Project Table
**Prompt:**
A high-fidelity projects list as a detailed table. Dark background (#0a0a0a). Top: "Projects" 14px bold white, right: search box `#222222` border, placeholder "Search projects...", filter dropdown, and "+ New" button. Table: 6 columns (Project, Status, Progress, Owner, Deadline, Tasks). Header: 11px uppercase `#666666`, 1px bottom border `#222222`. Each row: 56px height, hover `#111111`, `#1a1a1a` separator between rows. Project name: white 14px with project icon. Status: pill tags — 4px padding, filled background — cyan 10% opacity for "Active", green for "Done", yellow for "On Hold". Progress: thin bar + percentage. Owner: avatar + name. Deadline: `#888888`, overdue in red bold. Tasks: "12/24 completed" in gray. Bottom: pagination "Showing 1–6 of 12" 11px `#666666". Think Linear's project list.

### Variant 4C — Kanban-Style Project Board
**Prompt:**
A high-fidelity project board layout. Dark background (#0a0a0a). Title "Projects" 14px bold white. 3 columns: "Active" (3 projects), "Completed" (2), "Archived" (1). Each column: 12px uppercase header `#666666`, 1px bottom border `#222222". Project cards inside: `#1a1a1a` bg, 1px border `#333333`, top accent bar (color-coded by priority: red=high, cyan=medium, gray=low). Card: project icon (16px), name 14px white, description 11px `#888888`. Progress circle (mini donut): 40px diameter, cyan stroke on `#222222` background, percentage in center 12px white. Bottom of card: 3 mini stats in a row — tasks count, members count, days remaining — 11px `#888888`. Column totals at bottom: "3 active" in `#666666". Minimal, flat, no effects.

---

## SCREEN 5: MEMORIES

### Variant 5A — Timeline Notes
**Prompt:**
A high-fidelity memories/knowledge base on dark background (#0a0a0a). Top: "Memories" title 14px bold white, right: search box `#222222` border, tag filter pills. Below: vertical timeline of memory entries. Each entry: 1px left border (color-coded by category: cyan=work, green=personal, yellow=idea, `#222222`=other). Entry card: `#1a1a1a` bg, 12px padding, 1px border `#222222`. Entry content: date `#666666` 11px monospace, title white 14px bold, excerpt `#888888` 12px, 2 lines max. Tags: small pills at bottom — "#meeting", "#decision", "#idea". Expand button `#666666` on right. Right sidebar: "Categories" — list of tags with count (Work: 12, Personal: 8, Ideas: 5). Bottom: "+ Capture Memory" cyan button. No glassmorphism, clean notes feel.

### Variant 5B — Card Grid
**Prompt:**
A high-fidelity memories grid view. Dark background (#0a0a0a). Top: "🧠 Memories" 14px bold white, right: view toggle (grid active), search, sort dropdown (Newest, Oldest, Most Used). Grid: 4 columns of memory cards. Each card: `#1a1a1a`, 1px border `#333333`, 200px height. Top: category icon (16px), timestamp `#666666` 11px right-aligned. Middle: title white 14px bold, preview text `#888888` 12px, 3 lines max with fade. Bottom: 2-3 tag pills ("work", "urgent", "reviewed"), small heart/bookmark icons. Card hover: `#222222` border, slight scale. Top section: "Pinned" area with 2 special cards that have cyan left border (pinned memories). Clean, Pinterest-like but terminal-styled.

### Variant 5C — Chat/Log Style
**Prompt:**
A high-fidelity memories as a chronological log. Dark background (#0a0a0a). Title "Memory Log" 14px bold white. Entries formatted as log lines with monospace font. Each entry: timestamp on left (11px `#555555`), category icon, title 13px white, content 12px `#888888`. 1px `#1a1a1a` divider between entries. Special entries: decision points highlighted with cyan left border, ideas with yellow left border. Bottom: input bar "Write a new memory..." with `#333333` border, cyan send button. Right sidebar: "Stats" — "Total memories: 127", "Most active: Work", "Streak: 14 days". Minimal, like reading a developer's daily log.

---

## SCREEN 6: DOCS

### Variant 6A — Document List
**Prompt:**
A high-fidelity documents page on dark background (#0a0a0a). Top: "📄 Docs" 14px bold white, right: "+ New Doc" button, search box, folder filter. Below: folder hierarchy shown as indented list. Top-level folders: 📁 Projects (12 docs), 📁 Meeting Notes (8), 📁 Templates (5), 📁 Archive (20). Each folder: 16px icon, name white 14px, doc count `#666666` 12px, expand arrow. Inside expanded folder: document entries — 48px height rows, 1px `#222222` bottom border. Each doc: file icon (14px), name white 13px, last edited `#666666` 11px, author avatar (16px) right, size `#555555` 11px. Hover: `#1a1a1a` bg. Recent docs section at top: 3 starred docs with cyan star icon. Clean file-explorer feel, no effects.

### Variant 6B — Notion-Style Editor Preview
**Prompt:**
A high-fidelity docs page with document list left + preview panel right. Dark background (#0a0a0a). Left sidebar (240px): folder tree — items with icons, disclosure arrows, 12px text. Main area: document preview — title 24px white bold, subtitle `#666666` 14px, below: rendered markdown content with headings (16px white bold), bullet points (`#19c3ff` bullets), code blocks (`#111111` bg, monospace 12px), inline links (cyan). Right panel (200px): "Document Info" — created date, last edited, word count (2,847 words), tags as pills, collaborators list (3 avatars). Top toolbar: edit buttons (B, I, Code, Quote, Link) in `#333333` bg with white icons. Clean, Notion-dark feel but simpler. No glass effects.

### Variant 6C — Document Cards
**Prompt:**
A high-fidelity docs as a card view. Dark background (#0a0a0a). Top: "Documents" 14px bold white, right: "+ New" and filter/sort controls. Layout: 3-column grid of doc cards. Each card: `#1a1a1a` bg, 1px border `#333333`, 12px padding. Top icon: 📄 for doc, 📋 for template, 📝 for notes — 20px. Title: white 14px bold. Preview: 2 lines of `#888888` text 12px, truncated with "...". Bottom row: modified date `#666666` 11px, tags (1-2 small pills). Card hover: `#222222` border, no glow. Top section: "Recently Opened" — horizontal scrollable strip of 4 mini cards with cyan left border. Bottom center: "Archive" link in `#666666`. Clean, simple, functional.

---

## SCREEN 7: TEAM

### Variant 7A — Team Roster
**Prompt:**
A high-fidelity team roster on dark background (#0a0a0a). Top: "Team" 14px bold white, right: "+ Invite" button cyan, role filter dropdown. Grid of member cards: 3-column layout. Each card: `#1a1a1a` bg, 1px border `#333333`, 16px padding. Top section: 32px circle avatar placeholder (gray with initials), name 14px bold white, role `#19c3ff` 12px below name. Below: status indicator (green dot=online, gray=inactive, yellow=away), last seen text `#666666` 11px. Stats row: 3 small items — "Tasks assigned", "Completed", "Efficiency %" — with numbers 12px white. Bottom: role badge pill ("Developer" cyan, "Designer" purple, "PM" green). Right sidebar: "Team Stats" — total members (8), online now (5), avg completion rate (87%). NO glassmorphism, clean org-directory feel.

### Variant 7B — Team Activity
**Prompt:**
A high-fidelity team activity dashboard. Dark background (#0a0a0a). Top: "Team Activity" 14px bold white. Below: horizontal member strip — 8 avatar circles (32px each) with names below in 10px, green dots for online members. Main area: activity feed/table. Columns: Member, Activity, Project, Time. Rows 48px height, alternating `#111111`/`#0a0a0a` bg. Activity cells with icon prefix: ✅ "Completed task", 📝 "Added comment", 🐛 "Fixed bug", 📊 "Updated docs". Time column: relative ("2m ago", "1h ago") in `#666666` 11px. Right sidebar: workload chart — horizontal bars showing tasks per member (cyan bars on `#222222` track). Top bar has "Most Active" badge. Bottom: team availability calendar mini (7-day strip showing who's available). Clean, busy-dashboard feel, functional.

### Variant 7C — Org-Chart Style
**Prompt:**
A high-fidelity team as an org chart. Dark background (#0a0a0a). Top: "Team Structure" 14px bold white, right: view toggle (chart active). Center: hierarchical tree. Top node: "Rahul — Lead/PM" — white card, cyan border, avatar 40px, name 14px bold, role 11px `#666666". Below: 2-3 connected branch nodes for different roles — connected by 1px `#333333` lines. Each child: `#1a1a1a` card, 1px border `#222222`, avatar 28px, name 13px white, role 11px `#666666`, status dot (green/gray). Hover card: shows 3 stats — tasks, projects, active since. Right panel: detailed info for selected member — full profile card with name, role, contact, bio (2 lines), current tasks (3 list items). Top-right: "Team Health" mini cards — 3 columns: "Open Tasks", "Avg Response Time", "Blockers" with numbers. Minimal organizational feel.

---

## SCREEN 8: OFFICE (Work Space)

### Variant 8A — Workspace Overview
**Prompt:**
A high-fidelity Office/workspace overview on dark background (#0a0a0a). Top: "🏢 Office" 14px bold white. Main area: 2 columns. Left (70%): "Current Focus" header, active task card (large, cyan left border, 32px padding) — task title 18px bold white, description `#888888` 14px, project tag cyan 11px, progress bar. Below: "Quick Access" — 4 mini cards in grid — Recent doc, Active meeting, Pending review, Unread messages — each with icon, title, count badge. Right (30%): "Status" card — online indicator green + "Working", "Do Not Disturb" toggle, current project name, time logged today, break timer. Bottom: "Workspace Settings" row — theme toggle, notification preference, working hours. Clean, personal-workspace feel, functional.

---

## SCREEN 9: ACTIVITY FEED (Right Sidebar)

### Variant 9A — Notification Stream
**Prompt:**
A high-fidelity activity feed as a right sidebar (~300px wide) on `#111111` background. Top: "Activity" 12px bold white, "Mark all read" link `#666666` right. Feed items stacked: each item 56px height, 12px padding, 1px `#222222` bottom border. Unread items: `#1a1a1a` bg, read items: transparent. Item: icon on left (🔵=task, 🟢=complete, 🟡=mention, 🔴=urgent), title 13px white (or `#888888` if read), timestamp 11px `#666666` right. Hover: `#222222` bg. Top: filter tabs "All" | "Tasks" | "Mentions" | "System" — active tab has cyan underline. Bottom: "Notification Settings" gear icon. Max 15 items, "Load more" link at bottom. No glass, flat list.

### Variant 9B — Real-Time Dashboard
**Prompt:**
A high-fidelity real-time activity panel as right sidebar. Dark `#111111` bg. Top: "Live Activity" with pulsing green dot. Below: summary cards (3 stacked): "Today" header — "8 tasks updated" cyan 12px, "2 meetings" gray, "1 deadline approaching" yellow. Feed below: timestamped entries — "13:42" `#555555` 11px, "rahul completed" 12px `#19c3ff`, "Deploy to prod" white 13px. Each entry: 1px `#222222` divider. Bottom section: "System Health" — 3 indicators: API (green dot + "OK"), Database (green dot + "OK"), Sync (yellow dot + "Syncing..."). Bottom: "Activity graph" — mini sparkline showing activity over 24 hours (cyan line on `#222222` bg). Real-time, dense, terminal-dashboard feel.

---

## SUMMARY

- **9 Screens** with **3 variants each** = **27 Total Prompts**
- Dark theme (#0a0a0a) with cyan accents (#19c3ff)
- NO glassmorphism, NO blur, NO gradients on surfaces
- Flat cards with 1px borders only
- Terminal/monospace/sheet-inspired aesthetic
- Executive SaaS quality (Linear/Vercel level)
- Ready for Snitch generation
