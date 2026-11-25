"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { commandCenterConfig } from "@/config/command-center.config";
import { t } from "@/lib/i18n";
import { useCommandCenter } from "@/lib/context";
import type { BotId, InboxMessage } from "@/lib/types";
import { Button, Chip, EmptyState, Panel } from "@/components/ui";
import { saveLocalState } from "@/lib/store";

export default function Inbox() {
  const { state, setState, lang } = useCommandCenter();
  const [bot, setBot] = useState<BotId>(
    commandCenterConfig.bots[0]?.id ?? "lucius",
  );
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const send = () => {
    if (!body.trim()) return;
    const msg: InboxMessage = {
      id: `out-${Date.now()}`,
      type: "user",
      from: "You",
      subject: subject || "Message to agent",
      body,
      at: new Date().toISOString(),
      status: "unread",
    };
    setState((s) => ({ ...s, inbox: [msg, ...s.inbox] }));
    saveLocalState({ ...state, inbox: [msg, ...state.inbox] });
    setSubject("");
    setBody("");
  };

  const archive = (id: string) => {
    setState((s) => ({
      ...s,
      inbox: s.inbox.map((m) => (m.id === id ? { ...m, status: "archived" as const } : m)),
    }));
  };

  const visible = state.inbox.filter((m) => m.status !== "archived");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold">{t(lang, "tabs.inbox")}</h1>

      <Panel>
        <h2 className="text-sm font-semibold mb-3">Compose to bot</h2>
        <select
          className="mb-2 w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm"
          value={bot}
          onChange={(e) => setBot(e.target.value as BotId)}
        >
          {commandCenterConfig.bots.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <input
          className="mb-2 w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-sm"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          className="w-full min-h-[100px] rounded-lg border border-line bg-surface p-3 text-sm"
          placeholder="Instructions for the agent…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button variant="primary" className="mt-2" onClick={send}>
          <Send className="h-3.5 w-3.5" />
          {t(lang, "buttons.submit")}
        </Button>
      </Panel>

      {visible.length === 0 ? (
        <EmptyState title={t(lang, "empty.inbox")} />
      ) : (
        <ul className="space-y-2">
          {visible.map((m) => (
            <li key={m.id}>
              <Panel className="flex flex-wrap justify-between gap-2">
                <motion.div>
                  <div className="flex items-center gap-2">
                    <Chip tone={m.status === "unread" ? "info" : "muted"}>{m.status}</Chip>
                    <span className="text-xs text-muted">{m.from}</span>
                  </div>
                  <h3 className="mt-1 font-medium text-sm">{m.subject}</h3>
                  <p className="text-sm text-muted mt-1">{m.body}</p>
                </motion.div>
                <Button size="sm" variant="ghost" onClick={() => archive(m.id)}>
                  Archive
                </Button>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}