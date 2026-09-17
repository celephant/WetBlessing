"use client";

import { useState } from "react";
import {
  FUNNEL_AUTH_ERR,
  FUNNEL_AUTH_HINT,
  FUNNEL_AUTH_OK,
  handoffFunnelToCh01,
} from "@/lib/funnel";
import type { GameState } from "@/lib/types";

type AuthMode = "register" | "login";

type FunnelAuthDockProps = {
  caption: string;
  state: GameState;
};

export function FunnelAuthDock({ caption, state }: FunnelAuthDockProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("register");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const finish = (next: AuthMode) => {
    setMode(next);
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
      className="dialog-dock funnel-auth-dock flex h-full w-full flex-col justify-end overflow-hidden"
      data-funnel-auth=""
      data-funnel-auth-mode={mode}
    >
      <div className="funnel-auth-strip">
        <p className="font-ui text-[15px] leading-5 text-paper">{caption}</p>
        <p className="font-ui text-[12px] leading-4 text-paper/70">{FUNNEL_AUTH_HINT}</p>
        {done ? (
          <p className="font-ui text-[15px] text-mint" data-funnel-auth-ok="">
            {FUNNEL_AUTH_OK}
          </p>
        ) : (
          <form
            className="funnel-auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              finish("register");
            }}
          >
            <div className="funnel-auth-fields">
              <input
                type="email"
                autoComplete={mode === "login" ? "username" : "email"}
                placeholder="邮箱"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <input
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="密码"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error ? (
              <p className="font-ui text-[12px] text-hot" data-funnel-auth-error="">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="btn-face btn-primary funnel-auth-primary choice-press"
              data-funnel-auth-primary="register"
            >
              注册并继续
            </button>
            <button
              type="button"
              className="funnel-auth-secondary choice-press"
              data-funnel-auth-secondary="login"
              onClick={() => finish("login")}
            >
              登录
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
