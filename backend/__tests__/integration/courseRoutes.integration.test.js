const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const Course = require("../../src/models/Course");
const CourseDetail = require("../../src/models/CourseDetail");
const CourseFeedback = require("../../src/models/CourseFeedback");
const User = require("../../src/models/User");

let app;

describe("Course Routes Integration Tests", () => {
  let mongoServer;
  let adminToken;
  let studentToken;
  let facultyToken;
  let adminUser;
  let studentUser;
  let facultyUser;
  let testCourse;

  beforeAll(async () => {
    // Disconnect from any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to in-memory database
    await mongoose.connect(mongoUri);

    // Import app after database is ready
    app = require("../../server");
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
    await Course.deleteMany({});
    await CourseDetail.deleteMany({});
    await CourseFeedback.deleteMany({});

    // Create test users
    adminUser = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@test.com",
      password: "password123",
      phone: "555-555-5555",
      role: "admin",
    });

    studentUser = await User.create({
      firstName: "Student",
      lastName: "User",
      email: "student@test.com",
      password: "password123",
      phone: "555-555-5556",
      role: "student",
    });

    facultyUser = await User.create({
      firstName: "Faculty",
      lastName: "User",
      email: "faculty@test.com",
      password: "password123",
      phone: "555-555-5557",
      role: "faculty",
    });

    // Generate tokens
    const { generateToken } = require("../../src/config/jwt");
    adminToken = generateToken(
      adminUser._id.toString(),
      adminUser.role,
      adminUser.email,
      adminUser.firstName,
      adminUser.lastName
    );

    studentToken = generateToken(
      studentUser._id.toString(),
      studentUser.role,
      studentUser.email,
      studentUser.firstName,
      studentUser.lastName
    );

    facultyToken = generateToken(
      facultyUser._id.toString(),
      facultyUser.role,
      facultyUser.email,
      facultyUser.firstName,
      facultyUser.lastName
    );

    // Create a test course
    testCourse = await Course.create({
      courseCode: "CS101",
      name: "Introduction to Computer Science",
      description: "A comprehensive introduction to computer science",
      instructor: facultyUser._id,
    });
  });

  describe("POST /api/courses", () => {
    it("should allow admin to create course", async () => {
      const courseData = {
        courseCode: "CS102",
        name: "Data Structures",
        description: "Learn about data structures",
        instructor: facultyUser._id.toString(),
      };

      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(courseData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.courseCode).toBe("CS102");
      expect(res.body.data.name).toBe("Data Structures");
    });

    it("should allow faculty to create course", async () => {
      const courseData = {
        courseCode: "CS103",
        name: "Algorithms",
        description: "Learn about algorithms",
        instructor: facultyUser._id.toString(),
      };

      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${facultyToken}`)
        .send(courseData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should allow admin to create course with instructor", async () => {
      const courseData = {
        courseCode: "CS104",
        name: "Database Systems",
        description: "Learn about databases",
        instructor: facultyUser._id.toString(),
      };

      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(courseData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.instructor).toBeDefined();
      // Check if instructor is populated or just an ID
      if (typeof res.body.data.instructor === "object") {
        expect(res.body.data.instructor._id).toBe(facultyUser._id.toString());
        expect(res.body.data.instructor.firstName).toBe("Faculty");
        expect(res.body.data.instructor.lastName).toBe("User");
      } else {
        expect(res.body.data.instructor).toBe(facultyUser._id.toString());
      }
    });

    it("should return 400 when instructor is not a faculty member", async () => {
      const courseData = {
        courseCode: "CS105",
        name: "Networks",
        description: "Learn about networks",
        instructor: studentUser._id.toString(),
      };

      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(courseData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should not allow student to create course", async () => {
      const courseData = {
        courseCode: "CS106",
        name: "Operating Systems",
        description: "Learn about OS",
        instructor: facultyUser._id.toString(),
      };

      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(courseData);

      expect(res.status).toBe(403);
    });

    it("should return 400 for duplicate course code", async () => {
      const courseData = {
        courseCode: "CS101", // Already exists
        name: "Duplicate Course",
        description: "This should fail",
      };

      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(courseData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("already exists");
    });

    it("should return 400 for missing required fields", async () => {
      const courseData = {
        courseCode: "CS102",
        // Missing name and description
      };

      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(courseData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/courses", () => {
    beforeEach(async () => {
      // Create multiple courses for pagination testing
      await Course.create({
        courseCode: "CS102",
        name: "Data Structures",
        description: "Learn data structures",
        instructor: facultyUser._id,
      });

      await Course.create({
        courseCode: "CS103",
        name: "Algorithms",
        description: "Learn algorithms",
        instructor: facultyUser._id,
      });
    });

    it("should get all courses with pagination", async () => {
      const res = await request(app)
        .get("/api/courses")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.count).toBe(3);
      expect(res.body.page).toBe(1);
    });

    it("should search courses by course code", async () => {
      const res = await request(app)
        .get("/api/courses?search=CS102")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].courseCode).toContain("CS102");
    });

    it("should require authentication", async () => {
      const res = await request(app).get("/api/courses");

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/courses/:id", () => {
    it("should get course by id", async () => {
      const res = await request(app)
        .get(`/api/courses/${testCourse._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.courseCode).toBe("CS101");
    });

    it("should get course with details when requested", async () => {
      // Add a detail to the course
      await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      const res = await request(app)
        .get(`/api/courses/${testCourse._id}?includeDetails=true`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.details).toBeDefined();
      expect(res.body.data.details.length).toBeGreaterThan(0);
    });

    it("should return 404 for non-existent course", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/courses/${fakeId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/courses/:id", () => {
    it("should allow admin to update course", async () => {
      const updateData = {
        name: "Updated Course Name",
      };

      const res = await request(app)
        .put(`/api/courses/${testCourse._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Updated Course Name");
    });

    it("should allow faculty to update course", async () => {
      const updateData = {
        description: "Updated description",
      };

      const res = await request(app)
        .put(`/api/courses/${testCourse._id}`)
        .set("Authorization", `Bearer ${facultyToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should not allow student to update course", async () => {
      const updateData = {
        name: "Hacked Course Name",
      };

      const res = await request(app)
        .put(`/api/courses/${testCourse._id}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/courses/:id", () => {
    it("should allow admin to delete course", async () => {
      const res = await request(app)
        .delete(`/api/courses/${testCourse._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify course is deleted
      const course = await Course.findById(testCourse._id);
      expect(course).toBeNull();
    });

    it("should not allow faculty to delete course", async () => {
      const res = await request(app)
        .delete(`/api/courses/${testCourse._id}`)
        .set("Authorization", `Bearer ${facultyToken}`);

      expect(res.status).toBe(403);
    });

    it("should not allow student to delete course", async () => {
      const res = await request(app)
        .delete(`/api/courses/${testCourse._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/courses/:id/details", () => {
    it("should allow admin to add course detail", async () => {
      const detailData = {
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
        description: "Introduction materials",
      };

      const res = await request(app)
        .post(`/api/courses/${testCourse._id}/details`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(detailData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Week 1: Introduction");
    });

    it("should allow faculty to add course detail", async () => {
      const detailData = {
        title: "Week 2: Advanced",
        type: "video",
        url: "https://example.com/week2.mp4",
      };

      const res = await request(app)
        .post(`/api/courses/${testCourse._id}/details`)
        .set("Authorization", `Bearer ${facultyToken}`)
        .send(detailData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should not allow student to add course detail", async () => {
      const detailData = {
        title: "Unauthorized Detail",
        type: "document",
        url: "https://example.com/bad.pdf",
      };

      const res = await request(app)
        .post(`/api/courses/${testCourse._id}/details`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(detailData);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/courses/:id/details", () => {
    beforeEach(async () => {
      await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1",
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      await CourseDetail.create({
        course: testCourse._id,
        title: "Week 2",
        type: "video",
        url: "https://example.com/week2.mp4",
      });
    });

    it("should get all course details", async () => {
      const res = await request(app)
        .get(`/api/courses/${testCourse._id}/details`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it("should filter details by type", async () => {
      const res = await request(app)
        .get(`/api/courses/${testCourse._id}/details?type=document`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].type).toBe("document");
    });
  });

  describe("PUT /api/courses/details/:detailId", () => {
    let testDetail;

    beforeEach(async () => {
      testDetail = await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1",
        type: "document",
        url: "https://example.com/week1.pdf",
      });
    });

    it("should allow admin to update course detail", async () => {
      const updateData = {
        title: "Week 1 Updated",
      };

      const res = await request(app)
        .put(`/api/courses/details/${testDetail._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Week 1 Updated");
    });

    it("should allow faculty to update course detail", async () => {
      const updateData = {
        url: "https://example.com/updated.pdf",
      };

      const res = await request(app)
        .put(`/api/courses/details/${testDetail._id}`)
        .set("Authorization", `Bearer ${facultyToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should not allow student to update course detail", async () => {
      const updateData = {
        title: "Hacked Title",
      };

      const res = await request(app)
        .put(`/api/courses/details/${testDetail._id}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData);

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/courses/details/:detailId", () => {
    let testDetail;

    beforeEach(async () => {
      testDetail = await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1",
        type: "document",
        url: "https://example.com/week1.pdf",
      });
    });

    it("should allow admin to delete course detail", async () => {
      const res = await request(app)
        .delete(`/api/courses/details/${testDetail._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const detail = await CourseDetail.findById(testDetail._id);
      expect(detail).toBeNull();
    });

    it("should allow faculty to delete course detail", async () => {
      const res = await request(app)
        .delete(`/api/courses/details/${testDetail._id}`)
        .set("Authorization", `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should not allow student to delete course detail", async () => {
      const res = await request(app)
        .delete(`/api/courses/details/${testDetail._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/courses/:id/feedback", () => {
    it("should allow student to add feedback", async () => {
      // First enroll the student
      const CourseEnrollment = require("../../src/models/CourseEnrollment");
      await CourseEnrollment.create({
        course: testCourse._id,
        student: studentUser._id,
        status: "accepted",
      });

      const feedbackData = {
        rating: 5,
        comment: "Excellent course!",
      };

      const res = await request(app)
        .post(`/api/courses/${testCourse._id}/feedback`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(feedbackData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
    });

    it("should return 400 for missing rating", async () => {
      const feedbackData = {
        comment: "Missing rating",
      };

      const res = await request(app)
        .post(`/api/courses/${testCourse._id}/feedback`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(feedbackData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid rating", async () => {
      const feedbackData = {
        rating: 6,
        comment: "Invalid rating",
      };

      const res = await request(app)
        .post(`/api/courses/${testCourse._id}/feedback`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(feedbackData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should update existing feedback for same user/course", async () => {
      // First enroll the student
      const CourseEnrollment = require("../../src/models/CourseEnrollment");
      await CourseEnrollment.create({
        course: testCourse._id,
        student: studentUser._id,
        status: "accepted",
      });

      // Add initial feedback
      await CourseFeedback.create({
        course: testCourse._id,
        user: studentUser._id,
        rating: 3,
        comment: "Initial feedback",
      });

      const feedbackData = {
        rating: 5,
        comment: "Updated feedback",
      };

      const res = await request(app)
        .post(`/api/courses/${testCourse._id}/feedback`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(feedbackData);

      expect(res.status).toBe(200);
      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.comment).toBe("Updated feedback");

      // Verify only one feedback exists
      const feedbackCount = await CourseFeedback.countDocuments({
        course: testCourse._id,
        user: studentUser._id,
      });
      expect(feedbackCount).toBe(1);
    });
  });

  describe("GET /api/courses/:id/feedback", () => {
    beforeEach(async () => {
      await CourseFeedback.create({
        course: testCourse._id,
        user: studentUser._id,
        rating: 5,
        comment: "Great!",
      });

      await CourseFeedback.create({
        course: testCourse._id,
        user: facultyUser._id,
        rating: 4,
        comment: "Good!",
      });
    });

    it("should get course feedback with statistics", async () => {
      const res = await request(app)
        .get(`/api/courses/${testCourse._id}/feedback`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.feedback).toBeInstanceOf(Array);
      expect(res.body.data.feedback.length).toBe(2);
      expect(res.body.data.statistics).toBeDefined();
      expect(res.body.data.statistics.averageRating).toBeGreaterThan(0);
      expect(res.body.data.statistics.totalFeedback).toBe(2);
    });
  });

  describe("GET /api/courses/:id/feedback/my", () => {
    beforeEach(async () => {
      await CourseFeedback.create({
        course: testCourse._id,
        user: studentUser._id,
        rating: 5,
        comment: "My feedback",
      });
    });

    it("should get user's own feedback", async () => {
      const res = await request(app)
        .get(`/api/courses/${testCourse._id}/feedback/my`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.comment).toBe("My feedback");
    });

    it("should return null if user has not provided feedback", async () => {
      const res = await request(app)
        .get(`/api/courses/${testCourse._id}/feedback/my`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeNull();
    });
  });

  describe("DELETE /api/courses/feedback/:feedbackId", () => {
    let studentFeedback;

    beforeEach(async () => {
      studentFeedback = await CourseFeedback.create({
        course: testCourse._id,
        user: studentUser._id,
        rating: 5,
        comment: "Great course!",
      });
    });

    it("should allow user to delete their own feedback", async () => {
      const res = await request(app)
        .delete(`/api/courses/feedback/${studentFeedback._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const feedback = await CourseFeedback.findById(studentFeedback._id);
      expect(feedback).toBeNull();
    });

    it("should allow admin to delete any feedback", async () => {
      const res = await request(app)
        .delete(`/api/courses/feedback/${studentFeedback._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should not allow other users to delete feedback", async () => {
      const res = await request(app)
        .delete(`/api/courses/feedback/${studentFeedback._id}`)
        .set("Authorization", `Bearer ${facultyToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
