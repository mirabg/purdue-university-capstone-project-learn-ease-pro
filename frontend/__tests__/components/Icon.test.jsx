import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Icon from "../../src/components/Icon";

describe("Icon", () => {
  describe("rendering", () => {
    test("renders icon without crashing", () => {
      const { container } = render(<Icon name="book" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    test("renders with custom className", () => {
      const { container } = render(
        <Icon name="book" className="custom-class" />
      );
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("custom-class");
    });

    test("renders with multiple classes", () => {
      const { container } = render(
        <Icon name="book" className="text-blue-500 h-6 w-6" />
      );
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("text-blue-500");
      expect(svg).toHaveClass("h-6");
      expect(svg).toHaveClass("w-6");
    });

    test("renders without className", () => {
      const { container } = render(<Icon name="book" />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("icon types", () => {
    const iconNames = [
      "book",
      "chat",
      "chat-reply",
      "chat-empty",
      "download",
      "rating-star",
      "star",
      "search",
      "users",
      "users-empty",
      "check-circle",
      "chevron-left",
      "chevron-right",
      "chevron-down",
    ];

    iconNames.forEach((iconName) => {
      test(`renders ${iconName} icon`, () => {
        const { container } = render(<Icon name={iconName} />);
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
      });
    });

    test("renders unknown icon type gracefully", () => {
      const { container } = render(<Icon name="unknown-icon" />);
      // Unknown icons should still render an SVG container or null
      // Component may log warning but shouldn't crash
      expect(container).toBeInTheDocument();
    });
  });

  describe("SVG attributes", () => {
    test("has correct SVG structure", () => {
      const { container } = render(<Icon name="book" />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("xmlns", "http://www.w3.org/2000/svg");
      expect(svg).toHaveAttribute("fill", "none");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
      expect(svg).toHaveAttribute("stroke", "currentColor");
    });

    test("uses currentColor for stroke", () => {
      const { container } = render(<Icon name="book" />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("stroke", "currentColor");
    });

    test("has no fill attribute value", () => {
      const { container } = render(<Icon name="book" />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("fill", "none");
    });
  });

  describe("custom props", () => {
    test("passes additional props to SVG element", () => {
      const { container } = render(
        <Icon name="book" data-testid="custom-icon" aria-label="Book icon" />
      );
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("data-testid", "custom-icon");
      expect(svg).toHaveAttribute("aria-label", "Book icon");
    });

    test("allows role attribute", () => {
      const { container } = render(<Icon name="book" role="img" />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("role", "img");
    });

    test("allows aria-hidden attribute", () => {
      const { container } = render(<Icon name="book" aria-hidden="true" />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("styling variations", () => {
    test("applies size classes correctly", () => {
      const { container } = render(<Icon name="book" className="h-8 w-8" />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("h-8");
      expect(svg).toHaveClass("w-8");
    });

    test("applies color classes correctly", () => {
      const { container } = render(
        <Icon name="book" className="text-red-500" />
      );
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("text-red-500");
    });

    test("combines multiple style classes", () => {
      const { container } = render(
        <Icon
          name="book"
          className="h-6 w-6 text-blue-600 hover:text-blue-800"
        />
      );
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("h-6");
      expect(svg).toHaveClass("w-6");
      expect(svg).toHaveClass("text-blue-600");
      expect(svg).toHaveClass("hover:text-blue-800");
    });
  });

  describe("different icon families", () => {
    test("renders navigation icons", () => {
      ["chevron-left", "chevron-right", "chevron-down"].forEach((icon) => {
        const { container } = render(<Icon name={icon} />);
        expect(container.querySelector("svg")).toBeInTheDocument();
      });
    });

    test("renders chat icons", () => {
      ["chat", "chat-reply", "chat-empty"].forEach((icon) => {
        const { container } = render(<Icon name={icon} />);
        expect(container.querySelector("svg")).toBeInTheDocument();
      });
    });

    test("renders user icons", () => {
      ["users", "users-empty"].forEach((icon) => {
        const { container } = render(<Icon name={icon} />);
        expect(container.querySelector("svg")).toBeInTheDocument();
      });
    });

    test("renders rating icons", () => {
      ["star", "rating-star"].forEach((icon) => {
        const { container } = render(<Icon name={icon} />);
        expect(container.querySelector("svg")).toBeInTheDocument();
      });
    });
  });

  describe("edge cases", () => {
    test("handles empty className", () => {
      const { container } = render(<Icon name="book" className="" />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    test("handles null className", () => {
      const { container } = render(<Icon name="book" className={null} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    test("handles undefined className", () => {
      const { container } = render(<Icon name="book" className={undefined} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    test("renders with empty name", () => {
      const { container } = render(<Icon name="" />);
      // Empty name should still render a container without crashing
      expect(container).toBeInTheDocument();
    });
  });
});
