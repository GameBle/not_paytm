import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Balance } from "../components/Balance";

describe("Balance", () => {
  it("formats balance as INR currency", () => {
    render(<Balance value={1234.5} />);
    expect(screen.getByText(/1,234\.50/)).toBeInTheDocument();
  });
});
