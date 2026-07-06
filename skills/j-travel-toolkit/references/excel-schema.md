# Excel Schema

## Required Template

Use one sheet named `行程`. Keep one table in that sheet.

Required columns:

| Column | Required | Meaning |
| --- | --- | --- |
| 日期 | Yes | Trip date, such as `4月3日` or a real Excel date |
| 星期 | No | Weekday label |
| 城市 | No | City or route, such as `成都→罗马` |
| 时间 | No | Time range or point, such as `07:00-10:00` |
| 行程 | Yes | Activity description |
| 交通 | No | Transport detail for this row, such as `飞机 U21686 FCO→NCE` |
| 住宿 | No | Hotel/lodging for this day |

Rules:

- The first row may contain a reminder/instruction line; the parser looks for the header row.
- Repeated dates may be blank after the first row; fill them downward while parsing.
- Repeated weekdays/cities may be blank after the first row; fill them downward while parsing.
- Repeated accommodation may be blank after the first row of a day; fill it once on the first row for that day.
- Put transport details in `交通` when useful. The app also infers transport from `行程` text.
- Treat `-` as a low-information activity and keep only when there are no other rows that day.
- Do not require a booking status column.
- Text like `已预约` should remain in the description or note; do not force it into a separate field.
