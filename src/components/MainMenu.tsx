"use client";
import React, { useMemo, useRef, useState, useEffect } from "react";

/**
 * Telegram‑style Mobile Messenger (single file, previewable)
 * - Pure React + Tailwind classes
 * - 100% мобильный UX (одна колонка, верхний бар, нижняя навигация)
 * - Две сцены: Список чатов и Экран чата
 * - Встроенный чат "AME" (бот-оповещатель)
 * - Локальные фейковые данные — без бэкенда
 */

// ============ helpers ============
const cx = (...cn: Array<string | false | undefined>) => cn.filter(Boolean).join(" ");

function Avatar({ src, alt, size = 40 }: { src?: string; alt: string; size?: number }) {
  return (
    <div
      className="rounded-full bg-[#2a2a2e] overflow-hidden shrink-0 border border-[#3a3a3f]"
      style={{ width: size, height: size }}
      aria-label={alt}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full grid place-items-center text-xs text-[#9aa0a6]">
          {alt.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}

function Icon({ name, className = "" }: { name: string; className?: string }) {
  switch (name) {
    case "search":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "back":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      );
    case "send":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22l-4-9-9-4 20-7Z" />
        </svg>
      );
    case "chats":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="14" rx="3" />
          <path d="M7 9h10M7 13h6" />
        </svg>
      );
    case "calls":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.66 12.66 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.66 12.66 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
}

// ============ data ============
export type Chat = { id: string; title: string; lastMessage: string; unread?: number; isAME?: boolean; avatar?: string };
type Message = { id: string; chatId: string; text: string; fromMe?: boolean; date: number };

const seedChats: Chat[] = [
  { id: "ame", title: "AME", lastMessage: "Добро пожаловать! Я буду присылать новости и обновления.", unread: 2, isAME: true },
  { id: "m1", title: "Марина", lastMessage: "Ок, созвон завтра?" },
  { id: "m2", title: "Dev Team", lastMessage: "PR #142 готов к ревью." },
];

const seedMessages: Message[] = [
  { id: "a1", chatId: "ame", text: "Привет! Это канал уведомлений AME.", date: Date.now() - 1000 * 60 * 50 },
  { id: "a2", chatId: "ame", text: "Новая версия доступна. Нажми Обновить на главном экране.", date: Date.now() - 1000 * 60 * 30 },
];

// ============ UI bits ============
function TopBar({ title, left, right }: { title: React.ReactNode; left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="h-14 px-3 flex items-center justify-between border-b border-[#2b2b30] bg-[#111214]" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="flex items-center gap-2 min-w-0">{left}<div className="font-semibold text-[#e7e7ea] truncate">{title}</div></div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

function Search({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="px-3 py-2">
      <div className="relative">
        <Icon name="search" className="w-4 h-4 text-[#7f8596] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Поиск"
          className="w-full bg-[#1a1b1f] text-[#e7e7ea] placeholder-[#7f8596] rounded-xl pl-9 pr-3 py-2 outline-none border border-[#2b2b30]"
        />
      </div>
    </div>
  );
}

function ChatRow({ chat, onClick }: { chat: Chat; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full px-3 py-2 flex items-center gap-3 text-left active:opacity-80">
      <Avatar alt={chat.title} size={48} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-[#e7e7ea] font-medium">{chat.title}</div>
          {chat.isAME && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2f6feb]/30 text-[#89b4ff] border border-[#2f6feb]/40">BOT</span>
          )}
        </div>
        <div className="text-sm text-[#9aa0a6] truncate">{chat.lastMessage}</div>
      </div>
      {chat.unread ? (
        <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-[#2f6feb] text-white">{chat.unread}</span>
      ) : null}
    </button>
  );
}

function Bubble({ text, fromMe }: { text: string; fromMe?: boolean }) {
  return (
    <div className={cx("max-w-[82%] rounded-2xl px-3 py-2 text-[15px] leading-snug", fromMe ? "ml-auto bg-[#2a6be1] text-white" : "bg-[#1c1e24] text-[#e7e7ea] border border-[#2b2b30]")}>{text}</div>
  );
}

function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [val, setVal] = useState("");
  const send = () => { const t = val.trim(); if (!t) return; onSend(t); setVal(""); };
  return (
    <div className="p-2 border-t border-[#2b2b30] bg-[#111214]" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}>
      <div className="flex items-end gap-2">
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          rows={1}
          placeholder="Сообщение"
          className="flex-1 resize-none bg-[#1a1b1f] text-[#e7e7ea] placeholder-[#7f8596] rounded-xl px-3 py-2 outline-none border border-[#2b2b30]"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button onClick={send} className="p-2 rounded-xl bg-[#2a6be1] text-white active:opacity-80">
          <Icon name="send" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function TabBar({ active, onTab }: { active: string; onTab: (t: string) => void }) {
  const Item = ({ id, label, icon }: { id: string; label: string; icon: string }) => (
    <button onClick={() => onTab(id)} className={cx("flex-1 grid place-items-center py-1", active === id ? "text-[#e7e7ea]" : "text-[#8d91a0]")}> 
      <Icon name={icon} className="w-6 h-6" />
      <div className="text-[11px] leading-none mt-0.5">{label}</div>
    </button>
  );
  return (
    <div className="h-14 border-t border-[#2b2b30] bg-[#111214] grid grid-cols-3" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <Item id="chats" label="Чаты" icon="chats" />
      <Item id="calls" label="Звонки" icon="calls" />
      <Item id="settings" label="Настройки" icon="settings" />
    </div>
  );
}

// ============ main mobile app ============
export default function MobileMessenger() {
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState<Chat[]>(seedChats);
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [activeChatId, setActiveChatId] = useState<string | null>("ame");
  const [tab, setTab] = useState("chats");
  const [kbOffset, setKbOffset] = useState(0); // смещение под виртуальную клавиатуру

  // --- keyboard-safe area handling (iOS/Android) ---
  useEffect(() => {
    const vv: any = (globalThis as any).visualViewport;
    if (!vv) return;
    const onResize = () => {
      const bottomInset = Math.max(0, vv.height + vv.offsetTop - window.innerHeight);
      setKbOffset(bottomInset);
    };
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    onResize();
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, []);

  const activeChat = useMemo(() => chats.find((c) => c.id === activeChatId) || null, [chats, activeChatId]);
  const filtered = useMemo(() => chats.filter((c) => c.title.toLowerCase().includes(query.toLowerCase())), [chats, query]);
  const activeMessages = useMemo(() => messages.filter((m) => m.chatId === activeChatId), [messages, activeChatId]);

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [activeMessages.length, activeChatId]);

  const handleSend = (text: string) => {
    if (!activeChatId) return;
    const msg: Message = { id: Math.random().toString(36).slice(2), chatId: activeChatId, text, fromMe: true, date: Date.now() };
    setMessages((prev) => [...prev, msg]);
    setChats((prev) => prev.map((c) => (c.id === activeChatId ? { ...c, lastMessage: text, unread: 0 } : c)));
  };

  const ChatsScreen = (
    <div className="flex flex-col h-full">
      <TopBar title="Чаты" right={<Icon name="search" className="w-6 h-6 text-[#9aa0a6]" />} />
      <Search value={query} onChange={setQuery} />
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="h-full grid place-items-center text-[#9aa0a6] p-6 text-center">Пусто. Напишите первым!</div>
        ) : (
          filtered.map((c) => <ChatRow key={c.id} chat={c} onClick={() => setActiveChatId(c.id)} />)
        )}
      </div>
    </div>
  );

  const ChatView = (
    <div className="flex flex-col h-full">
      <TopBar
        title={
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveChatId(null)} aria-label="Назад" className="active:opacity-80 min-h-11 min-w-11 grid place-items-center">
              <Icon name="back" className="w-6 h-6 text-[#9aa0a6]" />
            </button>
            <Avatar alt={activeChat?.title || "Chat"} size={30} />
            <div className="leading-tight">
              <div className="font-semibold text-[clamp(15px,3.8vw,17px)]">{activeChat?.title || "Чат"}</div>
              {activeChat?.isAME && <div className="text-[11px] text-[#89b4ff]">Оповещения и новости</div>}
            </div>
          </div>
        }
      />
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#0f1013]">
        {activeMessages.length ? (
          activeMessages.map((m) => <Bubble key={m.id} text={m.text} fromMe={m.fromMe} />)
        ) : (
          <div className="h-full grid place-items-center text-[#9aa0a6] p-6 text-center">Сообщений пока нет.</div>
        )}
      </div>
      <div style={{ paddingBottom: `calc(env(safe-area-inset-bottom) + ${Math.max(0, kbOffset)}px)` }}>
        <Composer onSend={handleSend} />
      </div>
    </div>
  );

  const CallsStub = (
    <div className="h-full grid place-items-center text-[#9aa0a6] p-6 text-center">Раздел «Звонки» (заглушка)</div>
  );
  const SettingsStub = (
    <div className="h-full grid place-items-center text-[#9aa0a6] p-6 text-center">Раздел «Настройки» (заглушка)</div>
  );

  // Only-phone viewport: фиксированная мобильная ширина, центр на больших экранах
  return (
    <div className="w-full h-dvh bg-[#0f1013] text-[#e7e7ea] grid place-items-center">
      <div className="w-full h-full max-w-[480px] mx-auto grid" style={{ gridTemplateRows: "1fr auto" }}>
        <div className="overflow-hidden">
          {tab === "chats" && (activeChatId ? ChatView : ChatsScreen)}
          {tab === "calls" && CallsStub}
          {tab === "settings" && SettingsStub}
        </div>
        <TabBar active={tab} onTab={setTab} />
      </div>
    </div>
  );
}

