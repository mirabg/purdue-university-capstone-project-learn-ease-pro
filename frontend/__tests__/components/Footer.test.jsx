import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@components/Footer";

describe("Footer", () => {
  it("should render footer with copyright text", () => {
    render(<Footer />);

    const copyright = screen.getByText(/© 2025 LearnEase Pro/i);
    expect(copyright).toBeInTheDocument();
  });

  it("should render footer with all rights reserved text", () => {
    render(<Footer />);

    const rightsText = screen.getByText(/All rights reserved/i);
    expect(rightsText).toBeInTheDocument();
  });

  it("should have proper styling classes", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("py-2", "bg-gray-50");
  });
});
