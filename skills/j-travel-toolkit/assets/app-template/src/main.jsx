import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Backpack,
  Bus,
  CalendarDays,
  Car,
  Check,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  Home,
  Info,
  Link as LinkIcon,
  MapPin,
  Plane,
  Ship,
  Train,
  Umbrella,
  Waypoints,
} from "lucide-react";
import trip from "./trip-data.json";
import "./styles.css";

const storageKey = `j-travel-toolkit:${trip.id || trip.title || "trip"}`;

function readSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(`${storageKey}:${key}`) || "[]"));
  } catch {
    return new Set();
  }
}

function writeSet(key, set) {
  localStorage.setItem(`${storageKey}:${key}`, JSON.stringify([...set]));
}

function App() {
  const [tab, setTab] = useState("itinerary");
  const [selectedDay, setSelectedDay] = useState(trip.days?.[0]?.id || "day-1");
  const [done, setDone] = useState(() => readSet("done"));
  const [packed, setPacked] = useState(() => readSet("packed"));
  const activeDay = useMemo(
    () => trip.days.find((day) => day.id === selectedDay) || trip.days[0],
    [selectedDay],
  );
  const activeIndex = Math.max(0, trip.days.findIndex((day) => day.id === activeDay?.id));

  function toggleDone(id) {
    const next = new Set(done);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setDone(next);
    writeSet("done", next);
  }

  function togglePacked(id) {
    const next = new Set(packed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPacked(next);
    writeSet("packed", next);
  }

  function showInstallHint() {
    window.alert("在手机浏览器打开这个链接后，点分享或菜单，选择“添加到主屏幕”。");
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">✈️</span>
          <div>
            <p className="brand-kicker">J人旅行神器</p>
            <h1>{trip.title}</h1>
          </div>
        </div>
        <button className="install-button" type="button" aria-label="添加到手机桌面提示" onClick={showInstallHint}>
          <Download size={22} />
        </button>
      </header>

      <main className="main">
        {tab === "itinerary" && (
          <ItineraryTab
            days={trip.days}
            activeDay={activeDay}
            activeIndex={activeIndex}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            done={done}
            toggleDone={toggleDone}
            transport={trip.transport}
          />
        )}
        {tab === "tips" && <TipsTab tips={trip.tips} packing={trip.packing} packed={packed} togglePacked={togglePacked} />}
        {tab === "transport" && <TransportTab transport={trip.transport} />}
        {tab === "links" && <LinksTab links={trip.links} />}
      </main>

      <nav className="bottom-nav" aria-label="主导航">
        <NavButton active={tab === "itinerary"} icon={<CalendarDays size={21} />} label="行程" onClick={() => setTab("itinerary")} />
        <NavButton active={tab === "tips"} icon={<Umbrella size={21} />} label="贴士" onClick={() => setTab("tips")} />
        <NavButton active={tab === "transport"} icon={<Train size={21} />} label="交通" onClick={() => setTab("transport")} />
        <NavButton active={tab === "links"} icon={<LinkIcon size={21} />} label="快捷" onClick={() => setTab("links")} />
      </nav>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }) {
  return (
    <button className={active ? "nav-button active" : "nav-button"} type="button" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ItineraryTab({ days, activeDay, activeIndex, selectedDay, setSelectedDay, done, toggleDone, transport }) {
  const highlight = useMemo(() => buildTransportHighlight(activeDay, transport), [activeDay, transport]);
  if (!activeDay) return <EmptyState title="还没有行程" text="请按模板填写日期、时间和行程。" />;

  return (
    <section>
      <div className="day-selector-shell">
        <div className="day-strip" role="tablist" aria-label="选择日期">
          {days.map((day, index) => (
            <button
              key={day.id}
              className={selectedDay === day.id ? "day-chip active" : "day-chip"}
              type="button"
              role="tab"
              aria-selected={selectedDay === day.id}
              onClick={() => setSelectedDay(day.id)}
            >
              <span>{day.date}</span>
              <strong>D{index + 1}</strong>
              <em>{compactRoute(day.city || "行程")}</em>
            </button>
          ))}
        </div>
      </div>

      <article className="day-hero">
        <div>
          <div className="day-title-line">
            <strong>Day {activeIndex + 1}</strong>
            {activeIndex === 0 && <span>今天</span>}
          </div>
          <p>{[activeDay.date, activeDay.weekday].filter(Boolean).join(" ")}</p>
        </div>
        <div className="city-pill">
          <MapPin size={16} />
          <span>{activeDay.city || routeDestination(trip.title) || "今日路线"}</span>
        </div>
      </article>

      {highlight && <TransportFocusCard item={highlight} />}

      <div className="timeline-panel">
        <div className="panel-title">
          <span />
          <h2>今日行程</h2>
        </div>
        {activeDay.activities.length === 0 ? (
          <EmptyState title="今天还没安排" text="这一日暂时没有行程。" />
        ) : (
          <div className="timeline-list">
            {activeDay.activities.map((activity) => (
              <button
                key={activity.id}
                className={done.has(activity.id) ? "timeline-row done" : "timeline-row"}
                type="button"
                onClick={() => toggleDone(activity.id)}
              >
                <span className="timeline-marker">
                  <span className="check-circle">{done.has(activity.id) && <Check size={13} />}</span>
                </span>
                <span className="timeline-copy">
                  <time>{activity.time || "待定"}</time>
                  <strong>{activity.title}</strong>
                  {activity.note && <em>{activity.note}</em>}
                  {activity.transport && <b>{activity.transport}</b>}
                </span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        )}
      </div>

      {activeDay.hotel && (
        <div className="info-card hotel-card">
          <Home size={19} />
          <div>
            <strong>{activeDay.hotel.name}</strong>
            <p>{[activeDay.hotel.city, activeDay.hotel.nights ? `${activeDay.hotel.nights}晚` : "", activeDay.hotel.note].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
      )}
    </section>
  );
}

function TransportFocusCard({ item }) {
  const Icon = transportIcon(item.type || item.title);
  return (
    <article className="focus-card">
      <div className="focus-head">
        <div>
          <strong>{item.title}</strong>
          <p>{[item.code, item.note].filter(Boolean).join(" · ")}</p>
        </div>
        <span>{item.kind}</span>
      </div>
      {item.reminder && <p className="focus-reminder">⚠ {item.reminder}</p>}
      <div className="focus-route">
        <div>
          <small>出发</small>
          <strong>{item.startTime || "待定"}</strong>
          <em>{item.departure || "出发地"}</em>
        </div>
        <div className="route-line">
          <span />
          <Icon size={24} />
          <span />
        </div>
        <div>
          <small>到达</small>
          <strong>{item.endTime || "待定"}</strong>
          <em>{item.arrival || "目的地"}</em>
        </div>
      </div>
    </article>
  );
}

function TipsTab({ tips = [], packing = [], packed, togglePacked }) {
  return (
    <section className="stack">
      <div className="soft-banner">
        <strong>出门前看一眼</strong>
        <p>天气、换汇、门票和必带物品。</p>
      </div>
      <div className="section-title">
        <Info size={18} />
        <h2>出门提醒</h2>
      </div>
      {tips.length === 0 ? <EmptyState title="还没有贴士" text="暂无出门提醒。" /> : null}
      {tips.map((tip) => (
        <div key={tip.id} className="tip-card">
          <strong>{tip.category || "提醒"}</strong>
          <p>{tip.text}</p>
        </div>
      ))}

      <div className="section-title">
        <Backpack size={18} />
        <h2>必备物品</h2>
      </div>
      <div className="packing-grid">
        {packing.map((item) => (
          <button key={item.id} className={packed.has(item.id) ? "pack-item done" : "pack-item"} type="button" onClick={() => togglePacked(item.id)}>
            <span className="check-circle">{packed.has(item.id) && <Check size={13} />}</span>
            <span>
              <strong>{item.name}</strong>
              <em>{item.category}</em>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function TransportTab({ transport = [] }) {
  return (
    <section className="stack">
      <div className="section-title">
        <Train size={18} />
        <h2>交通安排</h2>
      </div>
      {transport.length === 0 ? <EmptyState title="还没有交通信息" text="暂无飞机、火车、打车或换乘安排。" /> : null}
      {transport.map((item) => {
        const Icon = transportIcon(item.type || item.title);
        return (
          <div key={item.id} className="transport-card">
            <div className="transport-icon"><Icon size={18} /></div>
            <div className="transport-main">
              <div className="transport-head">
                <strong>{item.title}</strong>
                <span>{item.date}</span>
              </div>
              <div className="transport-route">
                <span>{item.departure || "出发"}</span>
                <ChevronRight size={16} />
                <span>{item.arrival || "到达"}</span>
              </div>
              <p>{[item.time, item.code, item.note].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function LinksTab({ links = [] }) {
  const groups = groupBy(links, (link) => link.category || "快捷入口");
  return (
    <section className="stack">
      <div className="soft-banner link-banner">
        <strong>常用入口</strong>
        <p>地图、购票、天气和工具都放这里。</p>
      </div>
      {Object.entries(groups).map(([category, items]) => (
        <div key={category}>
          <div className="section-title">
            <MapPin size={18} />
            <h2>{category}</h2>
          </div>
          <div className="link-list">
            {items.map((link) => (
              <a key={link.id} className="link-card" href={link.url || "#"} target="_blank" rel="noreferrer">
                <span>
                  <strong>{link.name}</strong>
                  <em>{link.purpose || "打开链接"}</em>
                </span>
                <ExternalLink size={16} />
              </a>
            ))}
          </div>
        </div>
      ))}
      {links.length === 0 && <EmptyState title="还没有快捷链接" text="暂无地图、购票、天气或工具入口。" />}
    </section>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function buildTransportHighlight(day, transport = []) {
  if (!day) return null;
  const item = transport.find((candidate) => clean(candidate.date) === clean(day.date)) || activityTransport(day);
  if (!item) return null;
  const times = splitTimeRange(item.time);
  return {
    ...item,
    kind: transportKind(item.type || item.title),
    startTime: times[0],
    endTime: times[1],
    departure: item.departure || splitRoute(day.city)[0],
    arrival: item.arrival || routeDestination(day.city),
    reminder: /机场|飞机|航班|直飞|转机|FCO|NCE|SIN|T\d/i.test(`${item.title} ${item.note || ""}`) ? "建议提前到达，预留值机和安检时间" : "",
  };
}

function activityTransport(day) {
  const activity = day.activities.find((candidate) => isTransportText(`${candidate.transport || ""} ${candidate.title || ""} ${candidate.note || ""}`));
  if (!activity) return null;
  const text = activity.transport || activity.title;
  const route = splitRoute(text);
  return {
    id: `focus-${activity.id}`,
    date: day.date,
    type: inferTransportType(text),
    title: text,
    code: inferTransportCode(text),
    departure: route[0] || splitRoute(day.city)[0],
    arrival: route[1] || routeDestination(day.city),
    time: activity.time,
    note: activity.transport ? activity.title : activity.note,
  };
}

function transportIcon(text) {
  if (/飞机|航班|直飞|转机|机场|flight/i.test(text)) return Plane;
  if (/高铁|火车|车站|train/i.test(text)) return Train;
  if (/打车|出租|taxi|车/.test(text)) return Car;
  if (/公交|地铁|巴士|大巴|bus/i.test(text)) return Bus;
  if (/轮渡|船|ferry/i.test(text)) return Ship;
  return Waypoints;
}

function transportKind(text) {
  if (/飞机|航班|直飞|转机|机场|flight/i.test(text)) return "交通";
  if (/高铁|火车|车站|train/i.test(text)) return "火车";
  if (/打车|出租|taxi|车/.test(text)) return "打车";
  if (/公交|地铁|巴士|大巴|bus/i.test(text)) return "换乘";
  if (/轮渡|船|ferry/i.test(text)) return "轮渡";
  return "交通";
}

function inferTransportType(text) {
  if (/飞机|航班|直飞|转机|机场|flight/i.test(text)) return "飞机";
  if (/高铁|火车|车站|train/i.test(text)) return "火车";
  if (/打车|出租|taxi/i.test(text)) return "打车";
  if (/公交|地铁|巴士|大巴|bus/i.test(text)) return "公共交通";
  if (/轮渡|船|ferry/i.test(text)) return "轮渡";
  return "交通";
}

function inferTransportCode(text) {
  const match = clean(text).match(/[A-Z0-9]{1,3}\d{2,5}/);
  return match ? match[0] : "";
}

function isTransportText(text) {
  return /飞机|航班|高铁|火车|打车|机场|车站|出发|到达|直飞|转机|轮渡|公交|地铁|步行|开车|巴士|大巴|taxi|train|flight/i.test(text);
}

function splitTimeRange(value) {
  const parts = clean(value).split(/\s*(?:-|–|—|~|－|至)\s*/).filter(Boolean);
  return [parts[0] || clean(value), parts[1] || ""];
}

function splitRoute(text) {
  return clean(text).split(/→|->|—|↔|⇄|-/).map(clean).filter(Boolean);
}

function routeDestination(value) {
  const parts = splitRoute(value);
  return parts[parts.length - 1] || clean(value);
}

function compactRoute(value) {
  return clean(value).replace(/\s+/g, "");
}

function clean(value) {
  if (value == null) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function groupBy(items, pick) {
  return items.reduce((acc, item) => {
    const key = pick(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

createRoot(document.getElementById("root")).render(<App />);
