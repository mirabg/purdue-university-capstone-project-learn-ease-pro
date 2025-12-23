import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "../../src/components/Footer";

describe("Footer", () => {
  describe("rendering", () => {
    test("renders without crashing", () => {
      render(<Footer />);
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    test("renders copyright text", () => {
      render(<Footer />);
      expect(
        screen.getByText(/© 2025. All rights reserved/i)
      ).toBeInTheDocument();
    });

    test("uses footer semantic HTML element", () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector("footer");
      expect(footer).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    test("applies correct base styling classes", () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector("footer");
      expect(footer).toHaveClass("py-2");
      expect(footer).toHaveClass("bg-gray-50");
    });

    test("applies responsive container classes", () => {
      const { container } = render(<Footer />);
      const innerDiv = container.querySelector(".max-w-7xl");
      expect(innerDiv).toBeInTheDocument();
      expect(innerDiv).toHaveClass("mx-auto");
      expect(innerDiv).toHaveClass("px-4");
      expect(innerDiv).toHaveClass("sm:px-6");
      expect(innerDiv).toHaveClass("lg:px-8");
    });

    test("centers copyright text", () => {
      render(<Footer />);
      const text = screen.getByText(/© 2025. All rights reserved/i);
      expect(text).toHaveClass("text-center");
      expect(text).toHaveClass("text-xs");
      expect(text).toHaveClass("text-gray-500");
    });
  });

  describe("accessibility", () => {
    test("footer has implicit contentinfo role", () => {
      render(<Footer />);
      const footer = screen.getByRole("contentinfo");
      expect(footer).toBeInTheDocument();
    });

    test("copyright text is readable", () => {
      render(<Footer />);
      const text = screen.getByText(/© 2025. All rights reserved/i);
      expect(text).toBeVisible();
    });
  });

  describe("content", () => {
    test("displays current year", () => {
      render(<Footer />);
      expect(screen.getByText(/2025/)).toBeInTheDocument();
    });

    test("displays copyright symbol", () => {
      render(<Footer />);
      expect(screen.getByText(/©/)).toBeInTheDocument();
    });

    test("displays all rights reserved text", () => {
      render(<Footer />);
      expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
    });
  });

  describe("layout structure", () => {
    test("has correct DOM hierarchy", () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector("footer");
      const innerDiv = footer?.querySelector(".max-w-7xl");
      const paragraph = innerDiv?.querySelector("p");

      expect(footer).toBeInTheDocument();
      expect(innerDiv).toBeInTheDocument();
      expect(paragraph).toBeInTheDocument();
    });

    test("paragraph is direct child of container div", () => {
      const { container } = render(<Footer />);
      const innerDiv = container.querySelector(".max-w-7xl");
      const paragraph = innerDiv?.querySelector("p");

      expect(paragraph?.parentElement).toBe(innerDiv);
    });
  });

  describe("snapshot consistency", () => {
    test("renders consistently", () => {
      const { container: container1 } = render(<Footer />);
      const { container: container2 } = render(<Footer />);

      expect(container1.innerHTML).toBe(container2.innerHTML);
    });
  });

  describe("text content", () => {
    test("contains complete copyright notice", () => {
      render(<Footer />);
      const fullText = screen.getByText(/© 2025. All rights reserved/i);
      expect(fullText.textContent).toMatch(/^© 2025\. All rights reserved$/);
    });

    test("text format is exact", () => {
      render(<Footer />);
      const text = screen.getByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === "p" &&
          content.includes("© 2025. All rights reserved")
        );
      });
      expect(text).toBeInTheDocument();
    });
  });

  describe("component isolation", () => {
    test("does not render additional elements", () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector("footer");

      // Should only have one child div (the container)
      expect(footer?.children.length).toBe(1);
    });

    test("paragraph contains only text, no child elements", () => {
      const { container } = render(<Footer />);
      const paragraph = container.querySelector("p");

      expect(paragraph?.children.length).toBe(0);
    });
  });
});
