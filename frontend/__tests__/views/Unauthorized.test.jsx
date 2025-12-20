import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Unauthorized from "@views/Unauthorized";
import { authService } from "@services/authService";

// Mock authService
vi.mock("@services/authService", () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Unauthorized", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render unauthorized page with correct content", () => {
    render(
      <BrowserRouter>
        <Unauthorized />
      </BrowserRouter>
    );

    expect(screen.getByText(/Unauthorized Access/i)).toBeInTheDocument();
    expect(
      screen.getByText(/You do not have permission to access this page/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/restricted to administrators only/i)
    ).toBeInTheDocument();
  });

  it("should display warning icon", () => {
    const { container } = render(
      <BrowserRouter>
        <Unauthorized />
      </BrowserRouter>
    );

    const warningIcon = container.querySelector("svg");
    expect(warningIcon).toBeInTheDocument();
  });

  it("should have Go Back button", () => {
    render(
      <BrowserRouter>
        <Unauthorized />
      </BrowserRouter>
    );

    const goBackButton = screen.getByText("Go Back");
    expect(goBackButton).toBeInTheDocument();
  });

  it("should have Go to Dashboard button", () => {
    render(
      <BrowserRouter>
        <Unauthorized />
      </BrowserRouter>
    );

    const dashboardButton = screen.getByText("Go to Dashboard");
    expect(dashboardButton).toBeInTheDocument();
  });

  it("should navigate back when Go Back button is clicked", () => {
    render(
      <BrowserRouter>
        <Unauthorized />
      </BrowserRouter>
    );

    const goBackButton = screen.getByText("Go Back");
    fireEvent.click(goBackButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("should navigate to dashboard when Go to Dashboard button is clicked", () => {
    render(
      <BrowserRouter>
        <Unauthorized />
      </BrowserRouter>
    );

    const dashboardButton = screen.getByText("Go to Dashboard");
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should display Need Access section", () => {
    render(
      <BrowserRouter>
        <Unauthorized />
      </BrowserRouter>
    );

    expect(screen.getByText("Need Access?")).toBeInTheDocument();
    expect(
      screen.getByText(/contact your system administrator/i)
    ).toBeInTheDocument();
  });

  it("should navigate to admin dashboard when user is admin", () => {
    authService.getCurrentUser.mockReturnValue({
      id: "1",
      email: "admin@example.com",
      role: "admin",
    });

    render(
      <BrowserRouter>
        <Unauthorized />
      </BrowserRouter>
    );

    const dashboardButton = screen.getByText("Go to Dashboard");
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("should navigate to student dashboard when user is student", () => {
    authService.getCurrentUser.mockReturnValue({
      id: "1",
      email: "student@example.com",
      role: "student",
    });

    render(
      <BrowserRouter>
        <Unauthorized />
      </BrowserRouter>
    );

    const dashboardButton = screen.getByText("Go to Dashboard");
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith("/student/dashboard");
  });

  it("should navigate to login when no user is logged in", () => {
    authService.getCurrentUser.mockReturnValue(null);

    render(
      <BrowserRouter>
        <Unauthorized />
      </BrowserRouter>
    );

    const dashboardButton = screen.getByText("Go to Dashboard");
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
