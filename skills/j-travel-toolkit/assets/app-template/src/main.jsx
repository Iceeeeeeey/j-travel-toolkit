import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Backpack,
  CalendarDays,
  Check,
  ChevronRight,
  ExternalLink,
  Home,
  Info,
  Link as LinkIcon,
  MapPin,
  Plane,
  Sparkles,
  Train,
  Umbrella,
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

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">J人旅行神器</p>
          <h1>{trip.title}</h1>
          <p className="subtitle">{trip.subtitle || "每天一页，一眼知道今天要干啥"}</p>
        </div>
        <div className="hero-badge">
          <Sparkles size={18} />
          <span>{trip.days.length} 天</span>
        </div>
      </header>

      <main className="main">
        {tab === "itinerary" && (
          <ItineraryTab
            days={trip.days}
            activeDay={activeDay}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            done={done}
            toggleDone={toggleDone}
          />
        )}
        {tab === "tips" && <TipsTab tips={trip.tips} packing={trip.packing} packed={packed} togglePacked={togglePacked} />}
        {tab === "transport" && <TransportTab transport={trip.transport} />}
        {tab === "links" && <LinksTab links={trip.links} />}
      </main>

      <nav className="bottom-nav" aria-label="主导航">
        <NavButton active={tab === "itinerary"} icon={<CalendarDays size={19} />} label="行程" onClick={() => setTab("itinerary")} />
        <NavButton active={tab === "tips"} icon={<Umbrella size={19} />} label="贴士" onClick={() => setTab("tips")} />
        <NavButton active={tab === "transport"} icon={<Train size={19} />} label="交通" onClick={() => setTab("transport")} />
        <NavButton active={tab === "links"} icon={<LinkIcon size={19} />} label="快捷" onClick={() => setTab("links")} />
      </nav>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }) {
  return (
    <button className={active ? "nav-button active" : "nav-button"} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ItineraryTab({ days, activeDay, selectedDay, setSelectedDay, done, toggleDone }) {
  if (!activeDay) return <EmptyState title="还没有行程" text="请在 Excel 的行程 sheet 填写日期和行程。" />;
  return (
    <section>
      <div className="day-strip">
        {days.map((day, index) => (
          <button
            key={day.id}
            className={selectedDay === day.id ? "day-chip active" : "day-chip"}
            onClick={() => setSelectedDay(day.id)}
          >
            <span>{day.date}</span>
            <strong>D{index + 1}</strong>
            <em>{day.city || "行程"}</em>
          </button>
        ))}
      </div>

      <article className="today-card">
        <div className="today-top">
          <div>
            <p className="date-line">{activeDay.date} {activeDay.weekday}</p>
            <h2>{activeDay.city || activeDay.title || "今日行程"}</h2>
          </div>
          <div className="day-number">D{days.findIndex((day) => day.id === activeDay.id) + 1}</div>
        </div>
        {activeDay.summary && <p className="notice">{activeDay.summary}</p>}
      </article>

      <div className="section-title">
        <CalendarDays size={18} />
        <h3>今天要干啥</h3>
      </div>
      <div className="timeline">
        {activeDay.activities.map((activity) => (
          <button
            key={activity.id}
            className={done.has(activity.id) ? "timeline-item done" : "timeline-item"}
            onClick={() => toggleDone(activity.id)}
          >
            <span className="check-circle">{done.has(activity.id) && <Check size={13} />}</span>
            <span className="time">{activity.time || "待定"}</span>
            <span className="activity-body">
              <strong>{activity.title}</strong>
              {activity.note && <em>{activity.note}</em>}
            </span>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>

      {activeDay.hotel && (
        <div className="info-card hotel-card">
          <Home size={18} />
          <div>
            <strong>{activeDay.hotel.name}</strong>
            <p>{[activeDay.hotel.city, activeDay.hotel.nights ? `${activeDay.hotel.nights}晚` : "", activeDay.hotel.note].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
      )}
    </section>
  );
}

function TipsTab({ tips = [], packing = [], packed, togglePacked }) {
  return (
    <section className="stack">
      <div className="section-title">
        <Info size={18} />
        <h3>出门提醒</h3>
      </div>
      {tips.length === 0 ? <EmptyState title="还没有贴士" text="可以在 Excel 的贴士 sheet 里补充天气、换汇、禁忌等。" /> : null}
      {tips.map((tip) => (
        <div key={tip.id} className="tip-card">
          <strong>{tip.category || "提醒"}</strong>
          <p>{tip.text}</p>
        </div>
      ))}

      <div className="section-title">
        <Backpack size={18} />
        <h3>必备物品</h3>
      </div>
      <div className="packing-grid">
        {packing.map((item) => (
          <button key={item.id} className={packed.has(item.id) ? "pack-item done" : "pack-item"} onClick={() => togglePacked(item.id)}>
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
        <h3>交通安排</h3>
      </div>
      {transport.length === 0 ? <EmptyState title="还没有交通信息" text="我会从行程文字里自动识别飞机、高铁、机场、车站等安排。" /> : null}
      {transport.map((item) => (
        <div key={item.id} className="transport-card">
          <div className="transport-icon">{item.type?.includes("飞") || item.type?.includes("航") ? <Plane size={18} /> : <Train size={18} />}</div>
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
      ))}
    </section>
  );
}

function LinksTab({ links = [] }) {
  const groups = groupBy(links, (link) => link.category || "快捷入口");
  return (
    <section className="stack">
      {Object.entries(groups).map(([category, items]) => (
        <div key={category}>
          <div className="section-title">
            <MapPin size={18} />
            <h3>{category}</h3>
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
      {links.length === 0 && <EmptyState title="还没有快捷链接" text="可添加购票、交通、天气、换汇等外部链接。" />}
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

function groupBy(items, pick) {
  return items.reduce((acc, item) => {
    const key = pick(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

createRoot(document.getElementById("root")).render(<App />);

