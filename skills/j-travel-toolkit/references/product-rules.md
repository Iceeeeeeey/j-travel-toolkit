# Product Rules

## Positioning

J人旅行神器 is not a full trip-planning system. It is the trip execution view:

- Users may plan in dense spreadsheets or docs.
- During the trip, they should only need a clear phone page for today.
- Optimize for "today, what do I do next?" instead of "show every planning detail."

## Information Architecture

Use four tabs:

1. 行程: day selector, today summary, activity timeline, hotel note
2. 贴士: weather/currency reminders, packing checklist, practical notes
3. 交通: flights, trains, transfers, taxi, public transit, walking, ferries
4. 快捷: ticketing, transport, tools, useful external links

## Mobile Interaction

- Horizontal day selector at the top of 行程.
- One active day at a time.
- Activities can be checked off and saved in localStorage.
- Packing items can be checked off and saved in localStorage.
- Bottom nav must remain reachable with one thumb.
- Avoid desktop-only layouts.

## Tone

Chinese labels should be short and practical. Avoid technical terms such as PWA in user-facing app copy.

Use:

- 添加到手机桌面
- 出门行动卡
- 今天要做什么
- 交通

Avoid:

- PWA
- 航班 tab as a broad label
- Complex setup text inside the generated app

