import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CourseModal from "@components/CourseModal";
import { courseService } from "@services/courseService";
import { userService } from "@services/userService";

vi.mock("@services/courseService");
vi.mock("@services/userService");

describe("CourseModal", () => {
  const mockOnClose = vi.fn();

  const mockInstructors = [
    {
      _id: "instructor1",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      role: "faculty",
    },
    {
      _id: "instructor2",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      role: "faculty",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getFacultyUsers to return instructors
    userService.getFacultyUsers.mockResolvedValue({
      success: true,
      data: mockInstructors,
    });
  });

  it("should not render when isOpen is false", () => {
    const { container } = render(
      <CourseModal isOpen={false} onClose={mockOnClose} course={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render create course modal when no course is provided", async () => {
    render(<CourseModal isOpen={true} onClose={mockOnClose} course={null} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: /Instructor/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Create New Course")).toBeInTheDocument();
    expect(screen.getByLabelText(/Course Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Course Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instructor/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create/i })).toBeInTheDocument();
  });

  it("should render edit course modal when course is provided", async () => {
    const course = {
      _id: "course123",
      courseCode: "CS101",
      name: "Introduction to Computer Science",
      description: "A comprehensive introduction",
      instructor: "instructor1",
      isActive: true,
      __v: 0,
    };

    render(<CourseModal isOpen={true} onClose={mockOnClose} course={course} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: /Instructor/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Edit Course")).toBeInTheDocument();
    expect(screen.getByDisplayValue("CS101")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Introduction to Computer Science")
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("A comprehensive introduction")
    ).toBeInTheDocument();

    const instructorSelect = screen.getByLabelText(/Instructor/i);
    expect(instructorSelect).toHaveValue("instructor1");

    expect(screen.getByRole("button", { name: /Update/i })).toBeInTheDocument();
  });

  it("should populate form with course data when course has instructor as object", async () => {
    const course = {
      _id: "course123",
      courseCode: "CS101",
      name: "Introduction to Computer Science",
      description: "A comprehensive introduction",
      instructor: {
        _id: "instructor1",
        firstName: "John",
        lastName: "Smith",
        email: "faculty@example.com",
      },
      isActive: true,
      __v: 0,
    };

    render(<CourseModal isOpen={true} onClose={mockOnClose} course={course} />);

    // Wait for instructors to load and check value
    await waitFor(() => {
      const instructorSelect = screen.getByLabelText(/Instructor/i);
      expect(instructorSelect).toHaveValue("instructor1");
    });
  });

  it("should disable courseCode field when editing", async () => {
    const course = {
      _id: "course123",
      courseCode: "CS101",
      name: "Introduction to Computer Science",
      description: "A comprehensive introduction",
      instructor: "instructor1",
      isActive: true,
      __v: 0,
    };

    render(<CourseModal isOpen={true} onClose={mockOnClose} course={course} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const courseCodeInput = screen.getByLabelText(/Course Code/i);
    expect(courseCodeInput).toBeDisabled();
  });

  it("should handle form input changes", async () => {
    render(<CourseModal isOpen={true} onClose={mockOnClose} course={null} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: /Instructor/i })
      ).toBeInTheDocument();
    });

    const courseCodeInput = screen.getByLabelText(/Course Code/i);
    const nameInput = screen.getByLabelText(/Course Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const instructorSelect = screen.getByLabelText(/Instructor/i);

    fireEvent.change(courseCodeInput, { target: { value: "CS101" } });
    fireEvent.change(nameInput, { target: { value: "Intro to CS" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Basic computer science" },
    });
    fireEvent.change(instructorSelect, {
      target: { value: "instructor1" },
    });

    expect(courseCodeInput).toHaveValue("CS101");
    expect(nameInput).toHaveValue("Intro to CS");
    expect(descriptionInput).toHaveValue("Basic computer science");
    expect(instructorSelect).toHaveValue("instructor1");
  });

  it("should handle checkbox change for isActive", async () => {
    render(<CourseModal isOpen={true} onClose={mockOnClose} course={null} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("should validate required fields on submit", async () => {
    render(<CourseModal isOpen={true} onClose={mockOnClose} course={null} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /Create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Course code is required")).toBeInTheDocument();
      expect(screen.getByText("Course name is required")).toBeInTheDocument();
      expect(screen.getByText("Description is required")).toBeInTheDocument();
      expect(screen.getByText("Instructor is required")).toBeInTheDocument();
    });

    expect(courseService.createCourse).not.toHaveBeenCalled();
  });

  it("should clear field error when user types", async () => {
    render(<CourseModal isOpen={true} onClose={mockOnClose} course={null} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /Create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Course code is required")).toBeInTheDocument();
    });

    const courseCodeInput = screen.getByLabelText(/Course Code/i);
    fireEvent.change(courseCodeInput, { target: { value: "CS101" } });

    await waitFor(() => {
      expect(
        screen.queryByText("Course code is required")
      ).not.toBeInTheDocument();
    });
  });

  it("should create new course successfully", async () => {
    courseService.createCourse.mockResolvedValueOnce({
      _id: "newCourse123",
      courseCode: "CS101",
      name: "Intro to CS",
      description: "Basic computer science",
      instructor: "instructor1",
      isActive: true,
    });

    render(<CourseModal isOpen={true} onClose={mockOnClose} course={null} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Course Code/i), {
      target: { value: "CS101" },
    });
    fireEvent.change(screen.getByLabelText(/Course Name/i), {
      target: { value: "Intro to CS" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Basic computer science" },
    });
    fireEvent.change(screen.getByLabelText(/Instructor/i), {
      target: { value: "instructor1" },
    });

    const submitButton = screen.getByRole("button", { name: /Create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(courseService.createCourse).toHaveBeenCalledWith({
        courseCode: "CS101",
        name: "Intro to CS",
        description: "Basic computer science",
        instructor: "instructor1",
        isActive: true,
      });
      expect(mockOnClose).toHaveBeenCalledWith(true);
    });
  });

  it("should update existing course successfully", async () => {
    const course = {
      _id: "course123",
      courseCode: "CS101",
      name: "Introduction to Computer Science",
      description: "A comprehensive introduction",
      instructor: "instructor1",
      isActive: true,
      __v: 0,
    };

    courseService.updateCourse.mockResolvedValueOnce({
      ...course,
      name: "Updated Course Name",
    });

    render(<CourseModal isOpen={true} onClose={mockOnClose} course={course} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Course Name/i);
    fireEvent.change(nameInput, { target: { value: "Updated Course Name" } });

    const submitButton = screen.getByRole("button", { name: /Update/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(courseService.updateCourse).toHaveBeenCalledWith("course123", {
        courseCode: "CS101",
        name: "Updated Course Name",
        description: "A comprehensive introduction",
        instructor: "instructor1",
        isActive: true,
        __v: 0,
      });
      expect(mockOnClose).toHaveBeenCalledWith(true);
    });
  });

  it("should display error message on create failure", async () => {
    const errorMessage = "Failed to create course";
    courseService.createCourse.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    render(<CourseModal isOpen={true} onClose={mockOnClose} course={null} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Course Code/i), {
      target: { value: "CS101" },
    });
    fireEvent.change(screen.getByLabelText(/Course Name/i), {
      target: { value: "Intro to CS" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Basic computer science" },
    });
    fireEvent.change(screen.getByLabelText(/Instructor/i), {
      target: { value: "instructor1" },
    });

    const submitButton = screen.getByRole("button", { name: /Create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("should display generic error message on failure without response message", async () => {
    courseService.createCourse.mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<CourseModal isOpen={true} onClose={mockOnClose} course={null} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Course Code/i), {
      target: { value: "CS101" },
    });
    fireEvent.change(screen.getByLabelText(/Course Name/i), {
      target: { value: "Intro to CS" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Basic computer science" },
    });
    fireEvent.change(screen.getByLabelText(/Instructor/i), {
      target: { value: "instructor1" },
    });

    const submitButton = screen.getByRole("button", { name: /Create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to save course")).toBeInTheDocument();
    });
  });

  it("should disable submit button while loading", async () => {
    courseService.createCourse.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ _id: "newCourse" }), 100);
        })
    );

    render(<CourseModal isOpen={true} onClose={mockOnClose} course={null} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Course Code/i), {
      target: { value: "CS101" },
    });
    fireEvent.change(screen.getByLabelText(/Course Name/i), {
      target: { value: "Intro to CS" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Basic computer science" },
    });
    fireEvent.change(screen.getByLabelText(/Instructor/i), {
      target: { value: "instructor1" },
    });

    const submitButton = screen.getByRole("button", { name: /Create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    const savingButton = screen.getByRole("button", { name: /Saving.../i });
    expect(savingButton).toBeDisabled();
  });

  it("should close modal when Cancel button is clicked", async () => {
    render(<CourseModal isOpen={true} onClose={mockOnClose} course={null} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledWith(false);
  });

  it("should close modal when X button is clicked", async () => {
    render(<CourseModal isOpen={true} onClose={mockOnClose} course={null} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", { name: "" });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledWith(false);
  });

  it("should reset form when modal is reopened", async () => {
    const { rerender } = render(
      <CourseModal isOpen={true} onClose={mockOnClose} course={null} />
    );

    // Wait for instructors to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Course Code/i), {
      target: { value: "CS101" },
    });
    fireEvent.change(screen.getByLabelText(/Course Name/i), {
      target: { value: "Intro to CS" },
    });

    rerender(
      <CourseModal isOpen={false} onClose={mockOnClose} course={null} />
    );
    rerender(<CourseModal isOpen={true} onClose={mockOnClose} course={null} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Course Code/i)).toHaveValue("");
    });
    expect(screen.getByLabelText(/Course Name/i)).toHaveValue("");
  });

  it("should validate that instructor is not selected", async () => {
    render(<CourseModal isOpen={true} onClose={mockOnClose} course={null} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Course Code/i), {
      target: { value: "CS101" },
    });
    fireEvent.change(screen.getByLabelText(/Course Name/i), {
      target: { value: "Intro to CS" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Basic computer science" },
    });
    // Leave instructor empty

    const submitButton = screen.getByRole("button", { name: /Create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Instructor is required")).toBeInTheDocument();
    });

    expect(courseService.createCourse).not.toHaveBeenCalled();
  });

  it("should handle isActive checkbox in form submission", async () => {
    courseService.createCourse.mockResolvedValueOnce({
      _id: "newCourse123",
      courseCode: "CS101",
      name: "Intro to CS",
      description: "Basic computer science",
      instructor: "instructor1",
      isActive: false,
    });

    render(<CourseModal isOpen={true} onClose={mockOnClose} course={null} />);

    // Wait for instructors to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Course Code/i), {
      target: { value: "CS101" },
    });
    fireEvent.change(screen.getByLabelText(/Course Name/i), {
      target: { value: "Intro to CS" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Basic computer science" },
    });
    fireEvent.change(screen.getByLabelText(/Instructor/i), {
      target: { value: "instructor1" },
    });

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox); // Uncheck isActive

    const submitButton = screen.getByRole("button", { name: /Create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(courseService.createCourse).toHaveBeenCalledWith({
        courseCode: "CS101",
        name: "Intro to CS",
        description: "Basic computer science",
        instructor: "instructor1",
        isActive: false,
      });
    });
  });

  it("should clear errors and submit error when modal is reopened", async () => {
    courseService.createCourse.mockRejectedValueOnce({
      response: { data: { message: "Failed to create" } },
    });

    const { rerender } = render(
      <CourseModal isOpen={true} onClose={mockOnClose} course={null} />
    );

    // Wait for instructors to load
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    // Trigger validation errors
    const submitButton = screen.getByRole("button", { name: /Create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Course code is required")).toBeInTheDocument();
    });

    // Fill form to trigger submit error
    fireEvent.change(screen.getByLabelText(/Course Code/i), {
      target: { value: "CS101" },
    });
    fireEvent.change(screen.getByLabelText(/Course Name/i), {
      target: { value: "Intro to CS" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Basic computer science" },
    });
    fireEvent.change(screen.getByLabelText(/Instructor/i), {
      target: { value: "instructor1" },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to create")).toBeInTheDocument();
    });

    // Close and reopen modal
    rerender(
      <CourseModal isOpen={false} onClose={mockOnClose} course={null} />
    );
    rerender(<CourseModal isOpen={true} onClose={mockOnClose} course={null} />);

    // Errors should be cleared
    expect(
      screen.queryByText("Course code is required")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Failed to create")).not.toBeInTheDocument();
  });
});
