import { describe, expect, it } from "vitest";
import { createFakeBot } from "../test/fake-bot.ts";
import { buildApp } from "./main.ts";
import { AppError } from "./shared/errors.ts";

describe("server skeleton", () => {
  const app = buildApp({ bot: createFakeBot().bot, botWebhookSecret: "secret" });
  app.get("/test/app-error", async () => {
    throw new AppError("slot_taken", "The slot is already booked", 409);
  });
  app.get("/test/crash", async () => {
    throw new Error("boom");
  });

  it("boots and answers /health", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });

  it("renders an AppError as the error envelope", async () => {
    const res = await app.inject({ method: "GET", url: "/test/app-error" });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: { code: "slot_taken", message: "The slot is already booked" } });
  });

  it("maps an unknown error to 500 internal", async () => {
    const res = await app.inject({ method: "GET", url: "/test/crash" });
    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({ error: { code: "internal", message: "Internal server error" } });
  });

  it("answers an unknown route with a not_found envelope", async () => {
    const res = await app.inject({ method: "GET", url: "/nope" });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe("not_found");
  });
});
