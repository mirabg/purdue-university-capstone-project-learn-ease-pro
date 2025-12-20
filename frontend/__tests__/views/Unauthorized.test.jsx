import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Unauthorized from "@views/Unauthorized";

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

    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
    expect(
      screen.getByText(/You don't have permission to access this page/i)
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

  it("should have Return to Login button", () => {
    render(
      <BrowserRouter>
        <Unauthorized />
      </BrowserRouter>
    );

    const loginButton = screen.getByText("Return to Login");
    expect(loginButton).toBeInTheDocument();
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

  it("should navigate to login when Return to Login button is clicked", () => {
    render(
      <BrowserRouter>
        <Unauthorized />
      </BrowserRouter>
    );

    const loginButton = screen.getByText("Return to Login");
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
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
});
