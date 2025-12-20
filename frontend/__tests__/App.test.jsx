import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import "@testing-library/jest-dom";

// Mock the components
vi.mock("@components/Header", () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock("@components/Footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock("@views/Login", () => ({
  default: () => <div data-testid="login">Login Page</div>,
}));

vi.mock("@views/Register", () => ({
  default: () => <div data-testid="register">Register Page</div>,
}));

vi.mock("@views/AdminDashboard", () => ({
  default: () => <div data-testid="admin-dashboard">Admin Dashboard</div>,
}));

vi.mock("@views/StudentDashboard", () => ({
  default: () => <div data-testid="student-dashboard">Student Dashboard</div>,
}));

vi.mock("@views/Unauthorized", () => ({
  default: () => <div data-testid="unauthorized">Unauthorized Page</div>,
}));

vi.mock("@components/AdminRoute", () => ({
  default: ({ children }) => <div data-testid="admin-route">{children}</div>,
}));

vi.mock("@components/PrivateRoute", () => ({
  default: ({ children }) => <div data-testid="private-route">{children}</div>,
}));

describe("App Component", () => {
  it("should render Header and Footer", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("should redirect root path to /login", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("login")).toBeInTheDocument();
    });
  });

  it("should render Login page at /login route", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("login")).toBeInTheDocument();
  });

  it("should render Register page at /register route", () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("register")).toBeInTheDocument();
  });

  it("should render Student Dashboard at /student/dashboard route", async () => {
    render(
      <MemoryRouter initialEntries={["/student/dashboard"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("student-dashboard")).toBeInTheDocument();
    });
  });

  it("should render Unauthorized page at /unauthorized route", () => {
    render(
      <MemoryRouter initialEntries={["/unauthorized"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("unauthorized")).toBeInTheDocument();
  });

  it("should render Admin Dashboard with AdminRoute wrapper at /admin/dashboard route", () => {
    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("admin-route")).toBeInTheDocument();
    expect(screen.getByTestId("admin-dashboard")).toBeInTheDocument();
  });

  it("should have proper layout structure with flex classes", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass(
      "min-h-screen",
      "bg-gray-50",
      "flex",
      "flex-col"
    );
  });

  it("should have gradient background for main content", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );

    const main = container.querySelector("main");
    expect(main).toHaveClass("flex-1");
    expect(main).toHaveClass("bg-gradient-to-br");
  });
});
