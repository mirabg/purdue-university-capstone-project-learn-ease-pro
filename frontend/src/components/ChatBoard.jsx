import { useState } from "react";
import PropTypes from "prop-types";
import {
  useGetPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from "@/store/apiSlice";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import ConfirmModal from "./ConfirmModal";
import Icon from "@components/Icon";

function ChatBoard({ courseId, courseInstructor }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [page, setPage] = useState(1);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [error, setError] = useState(null);

  // RTK Query hooks
  const {
    data: postsData,
    isLoading: loading,
    error: queryError,
  } = useGetPostsQuery({ courseId, page, limit: 10 });

  const [createPost] = useCreatePostMutation();
  const [updatePost] = useUpdatePostMutation();
  const [deletePost] = useDeletePostMutation();

  const posts = postsData?.data || [];
  const totalPages = postsData?.pagination?.pages || 1;
  const totalPosts = postsData?.pagination?.total || 0;

  const handleCreatePost = async (postData) => {
    try {
      setError(null);
      await createPost({
        courseId,
        ...postData,
      }).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error.data?.message || "Failed to create post");
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  };

  const handleUpdatePost = async (postData) => {
    try {
      setError(null);
      await updatePost({
        courseId,
        postId: editingPost._id,
        ...postData,
      }).unwrap();
      setEditingPost(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating post:", error);
      setError(error.data?.message || "Failed to update post");
      setTimeout(() => setError(null), 5000);
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
      setError(null);
      await deletePost({
        courseId,
        postId: postToDelete,
      }).unwrap();
      setPostToDelete(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      setError(error.data?.message || "Failed to delete post");
      setTimeout(() => setError(null), 5000);
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
      {/* Error message */}
      {(error || queryError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <Icon
              name="error"
              className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5"
            />
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-700">
                {error ||
                  queryError?.data?.message ||
                  "Failed to load discussion posts"}
              </p>
            </div>
            {error && (
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

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
              onDelete={handleDeletePost}
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
