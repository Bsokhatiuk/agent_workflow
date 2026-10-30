import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "./client.ts";

vi.mock("@telegram-apps/sdk-react", () => ({ retrieveRawInitData: () => "query_id=1&hash=abc" }));

function respond(status: number, body: unknown) {
  return vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends Authorization: tma <initData>", async () => {
    const fetchMock = respond(200, { status: "ok" });
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiFetch("/health")).resolves.toEqual({ status: "ok" });

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get("Authorization")).toBe("tma query_id=1&hash=abc");
  });

  it("throws the error envelope as ApiError", async () => {
    vi.stubGlobal("fetch", respond(409, { error: { code: "slot_taken", message: "Taken" } }));

    await expect(apiFetch("/x")).rejects.toEqual(new ApiError("slot_taken", "Taken", 409));
  });
});
