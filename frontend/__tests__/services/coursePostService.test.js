import { describe, test, expect, vi, beforeEach } from "vitest";
import { coursePostService } from "../../src/services/coursePostService";
import api from "../../src/services/api";

vi.mock("../../src/services/api");

describe("coursePostService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPostsByCourse", () => {
    test("should fetch posts with default pagination", async () => {
      const mockResponse = {
        data: {
          posts: [
            { id: "1", title: "Post 1", content: "Content 1" },
            { id: "2", title: "Post 2", content: "Content 2" },
          ],
          total: 2,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await coursePostService.getPostsByCourse("course123");

      expect(api.get).toHaveBeenCalledWith(
        "/posts/courses/course123/posts?page=1&limit=10"
      );
      expect(result).toEqual(mockResponse.data);
    });

    test("should fetch posts with custom pagination", async () => {
      const mockResponse = {
        data: { posts: [], total: 50 },
      };

      api.get.mockResolvedValue(mockResponse);

      await coursePostService.getPostsByCourse("course123", 3, 25);

      expect(api.get).toHaveBeenCalledWith(
        "/posts/courses/course123/posts?page=3&limit=25"
      );
    });

    test("should handle fetch error", async () => {
      api.get.mockRejectedValue(new Error("Course not found"));

      await expect(
        coursePostService.getPostsByCourse("invalid")
      ).rejects.toThrow("Course not found");
    });
  });

  describe("getPostById", () => {
    test("should fetch a single post by ID", async () => {
      const mockResponse = {
        data: {
          id: "post123",
          title: "Test Post",
          content: "Test Content",
          author: "user123",
          isPinned: false,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await coursePostService.getPostById("post123");

      expect(api.get).toHaveBeenCalledWith("/posts/posts/post123");
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle post not found", async () => {
      api.get.mockRejectedValue(new Error("Post not found"));

      await expect(coursePostService.getPostById("invalid")).rejects.toThrow(
        "Post not found"
      );
    });
  });

  describe("createPost", () => {
    test("should create a new post", async () => {
      const postData = {
        course: "course123",
        title: "New Discussion",
        content: "Let's discuss this topic",
      };

      const mockResponse = {
        data: {
          id: "newpost123",
          ...postData,
          author: "user123",
          createdAt: "2024-01-01",
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await coursePostService.createPost(postData);

      expect(api.post).toHaveBeenCalledWith(
        "/posts/courses/course123/posts",
        postData
      );
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle validation error", async () => {
      api.post.mockRejectedValue(new Error("Title is required"));

      await expect(
        coursePostService.createPost({ course: "course123" })
      ).rejects.toThrow("Title is required");
    });
  });

  describe("updatePost", () => {
    test("should update a post", async () => {
      const updateData = {
        title: "Updated Title",
        content: "Updated Content",
      };

      const mockResponse = {
        data: {
          id: "post123",
          ...updateData,
        },
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await coursePostService.updatePost("post123", updateData);

      expect(api.put).toHaveBeenCalledWith("/posts/posts/post123", updateData);
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle update error", async () => {
      api.put.mockRejectedValue(new Error("Unauthorized"));

      await expect(coursePostService.updatePost("post123", {})).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("deletePost", () => {
    test("should delete a post", async () => {
      const mockResponse = {
        data: {
          message: "Post deleted successfully",
        },
      };

      api.delete.mockResolvedValue(mockResponse);

      const result = await coursePostService.deletePost("post123");

      expect(api.delete).toHaveBeenCalledWith("/posts/posts/post123");
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle delete error", async () => {
      api.delete.mockRejectedValue(new Error("Post not found"));

      await expect(coursePostService.deletePost("invalid")).rejects.toThrow(
        "Post not found"
      );
    });
  });

  describe("togglePinPost", () => {
    test("should toggle pin status of a post", async () => {
      const mockResponse = {
        data: {
          id: "post123",
          isPinned: true,
        },
      };

      api.patch.mockResolvedValue(mockResponse);

      const result = await coursePostService.togglePinPost("post123");

      expect(api.patch).toHaveBeenCalledWith("/posts/posts/post123/pin");
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle pin toggle error", async () => {
      api.patch.mockRejectedValue(new Error("Unauthorized - Faculty only"));

      await expect(coursePostService.togglePinPost("post123")).rejects.toThrow(
        "Unauthorized - Faculty only"
      );
    });
  });

  describe("getRepliesByPost", () => {
    test("should fetch replies with default pagination", async () => {
      const mockResponse = {
        data: {
          replies: [
            { id: "1", content: "Reply 1" },
            { id: "2", content: "Reply 2" },
          ],
          total: 2,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await coursePostService.getRepliesByPost("post123");

      expect(api.get).toHaveBeenCalledWith(
        "/posts/posts/post123/replies?page=1&limit=20"
      );
      expect(result).toEqual(mockResponse.data);
    });

    test("should fetch replies with custom pagination", async () => {
      const mockResponse = {
        data: { replies: [], total: 100 },
      };

      api.get.mockResolvedValue(mockResponse);

      await coursePostService.getRepliesByPost("post123", 2, 50);

      expect(api.get).toHaveBeenCalledWith(
        "/posts/posts/post123/replies?page=2&limit=50"
      );
    });

    test("should handle replies fetch error", async () => {
      api.get.mockRejectedValue(new Error("Post not found"));

      await expect(
        coursePostService.getRepliesByPost("invalid")
      ).rejects.toThrow("Post not found");
    });
  });

  describe("createReply", () => {
    test("should create a reply to a post", async () => {
      const replyData = {
        content: "This is my reply to the discussion",
      };

      const mockResponse = {
        data: {
          id: "reply123",
          ...replyData,
          author: "user123",
          createdAt: "2024-01-01",
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await coursePostService.createReply("post123", replyData);

      expect(api.post).toHaveBeenCalledWith(
        "/posts/posts/post123/replies",
        replyData
      );
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle reply creation error", async () => {
      api.post.mockRejectedValue(new Error("Content is required"));

      await expect(
        coursePostService.createReply("post123", {})
      ).rejects.toThrow("Content is required");
    });
  });

  describe("updateReply", () => {
    test("should update a reply", async () => {
      const updateData = {
        content: "Updated reply content",
      };

      const mockResponse = {
        data: {
          id: "reply123",
          ...updateData,
        },
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await coursePostService.updateReply(
        "reply123",
        updateData
      );

      expect(api.put).toHaveBeenCalledWith(
        "/posts/replies/reply123",
        updateData
      );
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle update reply error", async () => {
      api.put.mockRejectedValue(new Error("Unauthorized"));

      await expect(
        coursePostService.updateReply("reply123", {})
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("deleteReply", () => {
    test("should delete a reply", async () => {
      const mockResponse = {
        data: {
          message: "Reply deleted successfully",
        },
      };

      api.delete.mockResolvedValue(mockResponse);

      const result = await coursePostService.deleteReply("reply123");

      expect(api.delete).toHaveBeenCalledWith("/posts/replies/reply123");
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle delete reply error", async () => {
      api.delete.mockRejectedValue(new Error("Reply not found"));

      await expect(coursePostService.deleteReply("invalid")).rejects.toThrow(
        "Reply not found"
      );
    });
  });
});
