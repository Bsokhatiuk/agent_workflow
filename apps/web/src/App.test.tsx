import { AppRoot } from "@telegram-apps/telegram-ui";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App.tsx";

describe("App", () => {
  it("renders the placeholder screen inside telegram-ui's AppRoot", () => {
    render(
      <AppRoot>
        <App />
      </AppRoot>,
    );
    expect(screen.getByText("Telegram Booking")).toBeTruthy();
  });
});
