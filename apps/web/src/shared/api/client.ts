import { retrieveRawInitData } from "@telegram-apps/sdk-react";
import type { ErrorEnvelope } from "shared";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

// Every request is authenticated by Telegram's signed initData; the server validates it.
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `tma ${retrieveRawInitData() ?? ""}`);
  if (init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    const { error } = (await res.json()) as ErrorEnvelope;
    throw new ApiError(error.code, error.message, res.status);
  }
  return (await res.json()) as T;
}
