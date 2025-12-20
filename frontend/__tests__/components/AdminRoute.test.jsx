import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminRoute from "@components/AdminRoute";
import { authService } from "@services/authService";

// Mock authService
vi.mock("@services/authService", () => ({
  authService: {
    isAuthenticated: vi.fn(),
    isAdmin: vi.fn(),
  },
}));

// Mock Navigate component
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }) => <div data-testid="navigate">{to}</div>,
  };
});

describe("AdminRoute", () => {
  const TestChild = () => <div data-testid="protected-content">Protected</div>;

  it("should redirect to login if not authenticated", () => {
    authService.isAuthenticated.mockReturnValue(false);
    authService.isAdmin.mockReturnValue(false);

    render(
      <BrowserRouter>
        <AdminRoute>
          <TestChild />
        </AdminRoute>
      </BrowserRouter>
    );

    expect(screen.getByTestId("navigate")).toHaveTextContent("/login");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("should redirect to unauthorized if authenticated but not admin", () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.isAdmin.mockReturnValue(false);

    render(
      <BrowserRouter>
        <AdminRoute>
          <TestChild />
        </AdminRoute>
      </BrowserRouter>
    );

    expect(screen.getByTestId("navigate")).toHaveTextContent("/unauthorized");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("should render children if authenticated and is admin", () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.isAdmin.mockReturnValue(true);

    render(
      <BrowserRouter>
        <AdminRoute>
          <TestChild />
        </AdminRoute>
      </BrowserRouter>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });
});
