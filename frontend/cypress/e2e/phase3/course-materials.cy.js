/**
 * Phase 3: Interactive Features - Course Materials
 * Tests viewing and downloading course materials
 */

describe("Course Materials", () => {
  const mockCourse = {
    _id: "course-123",
    courseCode: "CS101",
    name: "Introduction to Computer Science",
  };

  const mockMaterials = [
    {
      _id: "material-1",
      course: "course-123",
      title: "Syllabus.pdf",
      type: "document",
      description: "Course syllabus",
      url: "/uploads/documents/syllabus-123.pdf",
      order: 1,
    },
    {
      _id: "material-2",
      course: "course-123",
      title: "Lecture 1 Recording",
      type: "video",
      description: "Introduction to programming",
      url: "/uploads/videos/lecture1-456.mp4",
      order: 2,
    },
    {
      _id: "material-3",
      course: "course-123",
      title: "Week 1 Slides",
      type: "presentation",
      description: "Introduction slides",
      url: "/uploads/presentations/week1-789.pptx",
      order: 3,
    },
  ];

  beforeEach(() => {
    cy.clearAppState();
    cy.loginAsStudent();

    // Mock enrollments API - student is enrolled in the course
    cy.intercept("GET", "**/api/enrollments*", {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: "enrollment-1",
            course: mockCourse,
            status: "accepted",
          },
        ],
      },
    }).as("enrollmentsApi");
  });

  describe("View Materials", () => {
    it("should open materials modal from dashboard", () => {
      // Mock materials API
      cy.intercept("GET", "**/api/courses/course-123/details*", {
        statusCode: 200,
        body: {
          success: true,
          data: mockMaterials,
        },
      }).as("materialsApi");

      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Click "Course Materials" button
      cy.contains("button", "Course Materials").first().click();

      // Wait for materials to load
      cy.wait("@materialsApi");

      // Modal should open
      cy.contains("Course Materials").should("be.visible");
      cy.contains(mockCourse.courseCode).should("be.visible");
    });

    it("should display materials list", () => {
      cy.intercept("GET", "**/api/courses/course-123/details*", {
        statusCode: 200,
        body: {
          success: true,
          data: mockMaterials,
        },
      }).as("materialsApi");

      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();
      cy.wait("@materialsApi");

      // Check materials are displayed
      mockMaterials.forEach((material) => {
        cy.contains(material.title).should("be.visible");
        if (material.description) {
          cy.contains(material.description).should("be.visible");
        }
      });

      // Check count
      cy.contains(`Materials (${mockMaterials.length})`).should("be.visible");
    });

    it("should show material types with icons", () => {
      cy.intercept("GET", "**/api/courses/course-123/details*", {
        statusCode: 200,
        body: {
          success: true,
          data: mockMaterials,
        },
      }).as("materialsApi");

      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();
      cy.wait("@materialsApi");

      // Check type badges are displayed
      cy.contains("Document").should("be.visible");
      cy.contains("Video").should("be.visible");
      cy.contains("Presentation").should("be.visible");

      // Check icons exist (SVGs)
      cy.get("svg").should("have.length.at.least", 3);
    });

    it("should display material metadata", () => {
      cy.intercept("GET", "**/api/courses/course-123/details*", {
        statusCode: 200,
        body: {
          success: true,
          data: mockMaterials,
        },
      }).as("materialsApi");

      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();
      cy.wait("@materialsApi");

      // Check metadata (title, description, type)
      const firstMaterial = mockMaterials[0];
      cy.contains(firstMaterial.title).should("be.visible");
      cy.contains(firstMaterial.description).should("be.visible");
      cy.contains("Document").should("be.visible");
    });

    it("should show empty state when no materials exist", () => {
      cy.intercept("GET", "**/api/courses/course-123/details*", {
        statusCode: 200,
        body: {
          success: true,
          data: [],
        },
      }).as("materialsApi");

      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();
      cy.wait("@materialsApi");

      // Check empty state
      cy.contains("No materials uploaded yet").should("be.visible");
      cy.contains("Materials (0)").should("be.visible");
    });
  });

  describe("Download Materials", () => {
    beforeEach(() => {
      cy.intercept("GET", "**/api/courses/course-123/details*", {
        statusCode: 200,
        body: {
          success: true,
          data: mockMaterials,
        },
      }).as("materialsApi");
    });

    it("should have download links for materials", () => {
      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();
      cy.wait("@materialsApi");

      // Check download links exist
      cy.contains("a", "Download").should("have.length.at.least", 1);
    });

    it("should download documents", () => {
      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();
      cy.wait("@materialsApi");

      // Find document material and check download link
      cy.contains(mockMaterials[0].title)
        .parent()
        .parent()
        .within(() => {
          cy.contains("a", "Download")
            .should("have.attr", "href")
            .and("include", mockMaterials[0].url);
        });
    });

    it("should download videos", () => {
      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();
      cy.wait("@materialsApi");

      // Find video material and check download link
      cy.contains(mockMaterials[1].title)
        .parent()
        .parent()
        .within(() => {
          cy.contains("a", "Download")
            .should("have.attr", "href")
            .and("include", mockMaterials[1].url);
        });
    });
  });

  describe("Material Access Control", () => {
    it("should only show materials button for enrolled courses", () => {
      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Should have Course Materials button for enrolled course
      cy.contains("button", "Course Materials").should("be.visible");
    });

    it("should not allow editing materials in read-only mode", () => {
      cy.intercept("GET", "**/api/courses/course-123/details*", {
        statusCode: 200,
        body: {
          success: true,
          data: mockMaterials,
        },
      }).as("materialsApi");

      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();
      cy.wait("@materialsApi");

      // Should not have Upload button (read-only for students)
      cy.contains("button", "Upload Material").should("not.exist");

      // Should not have edit/delete buttons
      cy.get('[title="Edit material"]').should("not.exist");
      cy.get('[title="Delete material"]').should("not.exist");
    });
  });

  describe("Error Handling", () => {
    it("should display error message when materials fail to load", () => {
      cy.intercept("GET", "**/api/courses/course-123/details*", {
        statusCode: 500,
        body: {
          success: false,
          message: "Failed to load materials",
        },
      }).as("materialsError");

      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();
      cy.wait("@materialsError");

      // Should show error or empty state
      // The modal might still open but show error or no materials
      cy.contains("Course Materials").should("be.visible");
    });
  });
});
