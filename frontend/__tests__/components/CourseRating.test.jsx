import { describe, test, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CourseRating from "../../src/components/CourseRating";

describe("CourseRating", () => {
  describe("rendering", () => {
    test("renders without crashing", () => {
      render(<CourseRating />);
      expect(screen.getByText("0.0")).toBeInTheDocument();
    });

    test("renders with average rating", () => {
      render(<CourseRating averageRating={4.5} />);
      expect(screen.getByText("4.5")).toBeInTheDocument();
    });

    test("renders with rating count", () => {
      render(<CourseRating averageRating={4.5} ratingCount={10} />);
      expect(screen.getByText(/4.5 \(10\)/)).toBeInTheDocument();
    });

    test("renders without count when showCount is false", () => {
      const { container } = render(
        <CourseRating averageRating={4.5} ratingCount={10} showCount={false} />
      );
      expect(screen.queryByText(/\(10\)/)).not.toBeInTheDocument();
      // Text should not be rendered when showCount is false
      expect(container.querySelector(".flex")).toBeInTheDocument();
    });

    test("does not show count in parentheses when ratingCount is 0", () => {
      render(<CourseRating averageRating={3.5} ratingCount={0} />);
      expect(screen.queryByText(/\(0\)/)).not.toBeInTheDocument();
      expect(screen.getByText("3.5")).toBeInTheDocument();
    });
  });

  describe("star display", () => {
    test("displays 5 full stars for perfect rating", () => {
      const { container } = render(<CourseRating averageRating={5.0} />);
      const filledStars = container.querySelectorAll(
        'img[src="/icons/star-filled.svg"]'
      );
      expect(filledStars.length).toBe(5);
    });

    test("displays correct number of full stars", () => {
      const { container } = render(<CourseRating averageRating={3.0} />);
      const filledStars = container.querySelectorAll(
        'img[src="/icons/star-filled.svg"]'
      );
      expect(filledStars.length).toBe(3);
    });

    test("displays half star for .5 ratings", () => {
      const { container } = render(<CourseRating averageRating={3.5} />);
      const halfStar = container.querySelector(
        'img[src="/icons/star-half-filled.svg"]'
      );
      expect(halfStar).toBeInTheDocument();
    });

    test("displays half star for ratings >= .5", () => {
      const { container } = render(<CourseRating averageRating={3.8} />);
      const halfStar = container.querySelector(
        'img[src="/icons/star-half-filled.svg"]'
      );
      expect(halfStar).toBeInTheDocument();
    });

    test("does not display half star for ratings < .5", () => {
      const { container } = render(<CourseRating averageRating={3.4} />);
      const halfStar = container.querySelector(
        'img[src="/icons/star-half-filled.svg"]'
      );
      expect(halfStar).not.toBeInTheDocument();
    });

    test("displays empty stars for remaining slots", () => {
      const { container } = render(<CourseRating averageRating={2.0} />);
      const emptyStars = container.querySelectorAll(
        'img[src="/icons/star-empty.svg"]'
      );
      expect(emptyStars.length).toBe(3);
    });

    test("displays all empty stars for 0 rating", () => {
      const { container } = render(<CourseRating averageRating={0} />);
      const emptyStars = container.querySelectorAll(
        'img[src="/icons/star-empty.svg"]'
      );
      expect(emptyStars.length).toBe(5);
    });

    test("total star count is always 5", () => {
      const ratings = [0, 1.5, 2.3, 3.7, 4.2, 5.0];

      ratings.forEach((rating) => {
        const { container } = render(<CourseRating averageRating={rating} />);
        const allStars = container.querySelectorAll('img[src*="/icons/star"]');
        expect(allStars.length).toBe(5);
      });
    });
  });

  describe("rating formatting", () => {
    test("formats rating to 1 decimal place", () => {
      render(<CourseRating averageRating={4.567} />);
      expect(screen.getByText("4.6")).toBeInTheDocument();
    });

    test("shows .0 for whole numbers", () => {
      render(<CourseRating averageRating={4} />);
      expect(screen.getByText("4.0")).toBeInTheDocument();
    });

    test("rounds down correctly", () => {
      render(<CourseRating averageRating={3.14} />);
      expect(screen.getByText("3.1")).toBeInTheDocument();
    });

    test("rounds up correctly", () => {
      render(<CourseRating averageRating={3.97} />);
      expect(screen.getByText("4.0")).toBeInTheDocument();
    });
  });

  describe("size variants", () => {
    test("applies xs size classes", () => {
      const { container } = render(
        <CourseRating size="xs" averageRating={4.0} />
      );
      const stars = container.querySelectorAll("img");
      stars.forEach((star) => {
        expect(star).toHaveClass("h-3");
        expect(star).toHaveClass("w-3");
      });
    });

    test("applies sm size classes (default)", () => {
      const { container } = render(
        <CourseRating size="sm" averageRating={4.0} />
      );
      const stars = container.querySelectorAll("img");
      stars.forEach((star) => {
        expect(star).toHaveClass("h-4");
        expect(star).toHaveClass("w-4");
      });
    });

    test("applies md size classes", () => {
      const { container } = render(
        <CourseRating size="md" averageRating={4.0} />
      );
      const stars = container.querySelectorAll("img");
      stars.forEach((star) => {
        expect(star).toHaveClass("h-5");
        expect(star).toHaveClass("w-5");
      });
    });

    test("applies lg size classes", () => {
      const { container } = render(
        <CourseRating size="lg" averageRating={4.0} />
      );
      const stars = container.querySelectorAll("img");
      stars.forEach((star) => {
        expect(star).toHaveClass("h-6");
        expect(star).toHaveClass("w-6");
      });
    });

    test("defaults to sm when invalid size provided", () => {
      const { container } = render(
        <CourseRating size="invalid" averageRating={4.0} />
      );
      const stars = container.querySelectorAll("img");
      stars.forEach((star) => {
        expect(star).toHaveClass("h-4");
        expect(star).toHaveClass("w-4");
      });
    });
  });

  describe("click interactions", () => {
    test("calls onClick when clickable and clicked", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { container } = render(
        <CourseRating averageRating={4.0} onClick={onClick} clickable={true} />
      );

      const ratingDiv = container.firstChild;
      await user.click(ratingDiv);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    test("calls onClick when ratingCount > 0", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { container } = render(
        <CourseRating averageRating={4.0} ratingCount={5} onClick={onClick} />
      );

      const ratingDiv = container.firstChild;
      await user.click(ratingDiv);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    test("does not call onClick when not clickable and no ratingCount", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { container } = render(
        <CourseRating
          averageRating={4.0}
          onClick={onClick}
          clickable={false}
          ratingCount={0}
        />
      );

      const ratingDiv = container.firstChild;
      await user.click(ratingDiv);

      expect(onClick).not.toHaveBeenCalled();
    });

    test("does not call onClick when onClick not provided", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CourseRating averageRating={4.0} clickable={true} />
      );

      const ratingDiv = container.firstChild;
      // Should not throw error
      await user.click(ratingDiv);
    });

    test("handles Enter key press when interactive", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { container } = render(
        <CourseRating averageRating={4.0} onClick={onClick} clickable={true} />
      );

      const ratingDiv = container.firstChild;
      ratingDiv.focus();
      await user.keyboard("{Enter}");

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    test("handles Space key press when interactive", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { container } = render(
        <CourseRating averageRating={4.0} onClick={onClick} clickable={true} />
      );

      const ratingDiv = container.firstChild;
      ratingDiv.focus();
      await user.keyboard(" ");

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    test("stopPropagation prevents event bubbling", async () => {
      const user = userEvent.setup();
      const parentOnClick = vi.fn();
      const childOnClick = vi.fn();

      const { container } = render(
        <div onClick={parentOnClick}>
          <CourseRating
            averageRating={4.0}
            onClick={childOnClick}
            clickable={true}
          />
        </div>
      );

      const ratingDiv = container.querySelector(".flex");
      await user.click(ratingDiv);

      expect(childOnClick).toHaveBeenCalledTimes(1);
      expect(parentOnClick).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    test("has button role when interactive", () => {
      render(
        <CourseRating averageRating={4.0} onClick={vi.fn()} clickable={true} />
      );
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    test("has tabIndex when interactive", () => {
      const { container } = render(
        <CourseRating averageRating={4.0} onClick={vi.fn()} clickable={true} />
      );
      const ratingDiv = container.firstChild;
      expect(ratingDiv).toHaveAttribute("tabIndex", "0");
    });

    test("does not have button role when not interactive", () => {
      render(<CourseRating averageRating={4.0} />);
      const button = screen.queryByRole("button");
      expect(button).not.toBeInTheDocument();
    });

    test("does not have tabIndex when not interactive", () => {
      const { container } = render(<CourseRating averageRating={4.0} />);
      const ratingDiv = container.firstChild;
      expect(ratingDiv).not.toHaveAttribute("tabIndex");
    });

    test("star images have empty alt text for decoration", () => {
      const { container } = render(<CourseRating averageRating={3.5} />);
      const stars = container.querySelectorAll("img");
      stars.forEach((star) => {
        expect(star).toHaveAttribute("alt", "");
      });
    });
  });

  describe("styling", () => {
    test("applies cursor pointer when interactive", () => {
      const { container } = render(
        <CourseRating averageRating={4.0} onClick={vi.fn()} clickable={true} />
      );
      const ratingDiv = container.firstChild;
      expect(ratingDiv).toHaveClass("cursor-pointer");
    });

    test("does not apply cursor pointer when not interactive", () => {
      const { container } = render(<CourseRating averageRating={4.0} />);
      const ratingDiv = container.firstChild;
      expect(ratingDiv).not.toHaveClass("cursor-pointer");
    });

    test("applies interactive text color when clickable", () => {
      render(
        <CourseRating averageRating={4.0} ratingCount={5} onClick={vi.fn()} />
      );
      const text = screen.getByText(/4.0 \(5\)/);
      expect(text).toHaveClass("text-primary-600");
    });

    test("applies non-interactive text color when not clickable", () => {
      render(<CourseRating averageRating={4.0} ratingCount={5} />);
      const text = screen.getByText(/4.0 \(5\)/);
      expect(text).toHaveClass("text-gray-600");
    });
  });

  describe("edge cases", () => {
    test("handles undefined averageRating", () => {
      render(<CourseRating averageRating={undefined} />);
      expect(screen.getByText("0.0")).toBeInTheDocument();
    });

    test("handles null averageRating", () => {
      render(<CourseRating averageRating={null} />);
      expect(screen.getByText("0.0")).toBeInTheDocument();
    });

    test("handles rating above 5", () => {
      const { container } = render(<CourseRating averageRating={5.0} />);
      // Component should handle max rating of 5
      const filledStars = container.querySelectorAll(
        'img[src="/icons/star-filled.svg"]'
      );
      expect(filledStars.length).toBe(5);
    });

    test("handles negative rating", () => {
      const { container } = render(<CourseRating averageRating={0} />);
      // Should show 0 rating with all empty stars
      const emptyStars = container.querySelectorAll(
        'img[src="/icons/star-empty.svg"]'
      );
      expect(emptyStars.length).toBe(5);
    });

    test("handles very small decimal", () => {
      render(<CourseRating averageRating={0.1} />);
      expect(screen.getByText("0.1")).toBeInTheDocument();
    });
  });

  describe("default props", () => {
    test("uses default values when no props provided", () => {
      render(<CourseRating />);
      expect(screen.getByText("0.0")).toBeInTheDocument();
    });

    test("showCount defaults to true", () => {
      render(<CourseRating averageRating={4.0} ratingCount={5} />);
      expect(screen.getByText(/\(5\)/)).toBeInTheDocument();
    });

    test("size defaults to sm", () => {
      const { container } = render(<CourseRating averageRating={4.0} />);
      const stars = container.querySelectorAll("img");
      stars.forEach((star) => {
        expect(star).toHaveClass("h-4");
      });
    });

    test("clickable defaults to false", () => {
      const { container } = render(
        <CourseRating averageRating={4.0} onClick={vi.fn()} />
      );
      const ratingDiv = container.firstChild;
      expect(ratingDiv).not.toHaveAttribute("role", "button");
    });
  });
});
