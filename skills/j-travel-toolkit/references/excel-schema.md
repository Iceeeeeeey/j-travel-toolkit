# Excel Schema

## Required Sheet: 行程

The simplest supported workbook uses one sheet named `行程`.

Required columns:

| Column | Required | Meaning |
| --- | --- | --- |
| 日期 | Yes | Trip date, such as `4月3日` or a real Excel date |
| 星期 | No | Weekday label |
| 城市 | No | City or route, such as `成都→罗马` |
| 时间 | No | Time range or point, such as `07:00-10:00` |
| 行程 | Yes | Activity description |

Rules:

- Repeated dates may be blank after the first row; fill them downward while parsing.
- Repeated weekdays/cities may be blank after the first row; fill them downward while parsing.
- Treat `-` as a low-information activity and keep only when there are no other rows that day.
- Do not require a booking status column.
- Text like `已预约` should remain in the description or note; do not force it into a separate field.

## Optional Sheet: 信息

| Column | Meaning |
| --- | --- |
| 项目 | Key |
| 内容 | Value |

Useful keys:

- 旅行名称
- 副标题
- 出发日期
- 主题色
- 目的地

## Optional Sheet: 交通

| Column | Meaning |
| --- | --- |
| 日期 | Date |
| 类型 | 飞机 / 火车 / 打车 / 公交 / 步行 / 轮渡 / 其他 |
| 编号 | Flight or train number |
| 出发 | Departure place |
| 到达 | Arrival place |
| 出发时间 | Departure time |
| 到达时间 | Arrival time |
| 备注 | Notes |

If absent, infer transport items from `行程` rows that mention 飞机, 航班, 高铁, 火车, 打车, 机场, 车站, 出发, 到达.

## Optional Sheet: 住宿

| Column | Meaning |
| --- | --- |
| 日期 | Check-in date or date covered |
| 城市 | City |
| 酒店 | Hotel name |
| 晚数 | Number of nights |
| 地址 | Address |
| 备注 | Notes |

## Optional Sheet: 物品

| Column | Meaning |
| --- | --- |
| 分类 | Category |
| 物品 | Item |
| 备注 | Notes |

Default categories include 证件, 钱包, 电子, 衣物, 洗护, 药品, 其他.

## Optional Sheet: 快捷

| Column | Meaning |
| --- | --- |
| 分类 | 景点购票 / 交通出行 / 工具 / 其他 |
| 名称 | Link display name |
| 用途 | Explain what this app/site is for |
| 链接 | URL |

## Optional Sheet: 贴士

| Column | Meaning |
| --- | --- |
| 分类 | Weather, currency, customs, safety, etc. |
| 内容 | Tip text |

