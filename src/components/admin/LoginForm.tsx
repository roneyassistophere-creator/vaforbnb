"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-1.5">
        <label htmlFor="admin-email" className="text-[15px] font-bold">
          Email
        </label>
        <input id="admin-email" name="email" type="email" autoComplete="username" required className="field min-h-12" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="admin-password" className="text-[15px] font-bold">
          Password
        </label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required className="field min-h-12" />
      </div>
      {state.error && (
        <p className="m-0 rounded-[12px] bg-coral-50 px-3.5 py-2.5 text-sm font-bold text-brand" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-coral min-h-12" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
