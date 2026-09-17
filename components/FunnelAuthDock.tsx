"use client";

import { useState } from "react";
import {
  FUNNEL_AUTH_ERR,
  FUNNEL_AUTH_HINT,
  FUNNEL_AUTH_OK,
  handoffFunnelToCh01,
} from "@/lib/funnel";
import type { GameState } from "@/lib/types";

type FunnelAuthDockProps = {
  caption: string;
  state: GameState;
};

export function FunnelAuthDock({ caption, state }: FunnelAuthDockProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"register" | "login">("register");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.includes("@") || password.length < 4) {
      setError(FUNNEL_AUTH_ERR);
      return;
    }
    setError("");
    setDone(true);
    handoffFunnelToCh01(state);
    window.setTimeout(() => {
      window.location.assign("/play?resume=1");
    }, 600);
  };

  return (
    <div
      className="dialog-dock flex h-full w-full flex-col justify-end overflow-y-auto px-5 py-2"
      data-funnel-auth=""
    >
      <div className="mx-auto flex w-full max-w-dialog flex-col gap-1.5">
        <p className="font-ui text-[15px] leading-6 text-paper">{caption}</p>
        <p className="font-ui text-[12px] text-mute">{FUNNEL_AUTH_HINT}</p>
        {done ? (
          <p className="font-ui text-[15px] text-mint" data-funnel-auth-ok="">
            {FUNNEL_AUTH_OK}
          </p>
        ) : (
          <form className="flex flex-col gap-1.5" onSubmit={submit}>
            <input
              type="email"
              autoComplete="email"
              placeholder="邮箱"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-[36px] rounded-chip border border-white/15 bg-white/10 px-3 font-ui text-[14px] text-paper outline-none"
            />
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="密码"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-[36px] rounded-chip border border-white/15 bg-white/10 px-3 font-ui text-[14px] text-paper outline-none"
            />
            {error ? (
              <p className="font-ui text-[12px] text-hot" data-funnel-auth-error="">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="btn-face btn-primary"
              data-funnel-auth-primary=""
            >
              {mode === "login" ? "登录" : "注册并继续"}
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="min-h-[36px] font-ui text-[13px] text-paper/70"
              data-funnel-auth-secondary=""
            >
              {mode === "login" ? "注册并继续" : "登录"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
