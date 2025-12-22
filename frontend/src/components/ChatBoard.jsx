import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { coursePostService } from "@services/coursePostService";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import ConfirmModal from "./ConfirmModal";
import Icon from "@components/Icon";

function ChatBoard({ courseId, courseInstructor }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    loadPosts();
  }, [courseId, page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursePostService.getPostsByCourse(
        courseId,
        page,
        10
      );
      setPosts(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalPosts(response.pagination?.total || 0);
    } catch (err) {
      console.error("Error loading posts:", err);
      setError("Failed to load discussion posts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      await coursePostService.createPost({
        ...postData,
        course: courseId,
      });
      await loadPosts();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating post:", error);
      alert(error.response?.data?.message || "Failed to create post");
      throw error;
    }
  };

  const handleUpdatePost = async (postData) => {
    try {
      await coursePostService.updatePost(editingPost._id, postData);
      await loadPosts();
      setEditingPost(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating post:", error);
      alert(error.response?.data?.message || "Failed to update post");
      throw error;
    }
  };

  const handleDeletePost = (postId) => {
    setPostToDelete(postId);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      await coursePostService.deletePost(postToDelete);
      await loadPosts();
      setPostToDelete(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(error.response?.data?.message || "Failed to delete post");
    }
  };

  const handleEditClick = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading discussion board...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Post Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Discussion Board
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {totalPosts > 0 ? (
              <>
                Displaying {(page - 1) * 10 + 1}-
                {Math.min((page - 1) * 10 + posts.length, totalPosts)} of{" "}
                {totalPosts} {totalPosts === 1 ? "post" : "posts"}
              </>
            ) : (
              "0 posts"
            )}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPost(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <img
            src="/icons/plus-white.svg"
            alt=""
            className="-ml-1 mr-2 h-5 w-5"
          />
          New Post
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Icon name="chat-empty" className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No posts yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating the first post
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onEdit={handleEditClick}
              onPostUpdated={loadPosts}
              onDelete={handleDeletePost}
              onReply={loadPosts}
              courseInstructor={courseInstructor}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Post Modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
        initialData={editingPost}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </div>
  );
}

ChatBoard.propTypes = {
  courseId: PropTypes.string.isRequired,
  courseInstructor: PropTypes.object,
};

export default ChatBoard;
