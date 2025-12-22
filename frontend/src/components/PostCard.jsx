import { useState } from "react";
import PropTypes from "prop-types";
import { formatDistanceToNow } from "date-fns";
import { authService } from "@services/authService";
import { coursePostService } from "@services/coursePostService";
import ConfirmModal from "./ConfirmModal";

function PostCard({
  post,
  onEdit,
  onPostUpdated,
  onDelete,
  onReply,
  courseInstructor,
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState("");
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [replyToDelete, setReplyToDelete] = useState(null);

  const currentUser = authService.getCurrentUser();
  const isFaculty = currentUser?.role === "faculty";
  const isOwner = currentUser?.id === post.user._id;
  const isInstructor = currentUser?.id === courseInstructor?._id;

  // Get role badge styling
  const getRoleBadge = (role) => {
    const badges = {
      faculty: {
        label: "Instructor",
        classes: "bg-purple-100 text-purple-800",
      },
      admin: { label: "Admin", classes: "bg-red-100 text-red-800" },
      student: { label: "Student", classes: "bg-blue-100 text-blue-800" },
    };
    return badges[role] || badges.student;
  };

  const loadReplies = async () => {
    try {
      setLoadingReplies(true);
      const response = await coursePostService.getRepliesByPost(post._id);
      setReplies(response.data || []);
    } catch (error) {
      console.error("Error loading replies:", error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleToggleReplies = () => {
    if (!showReplies && replies.length === 0) {
      loadReplies();
    }
    setShowReplies(!showReplies);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setSubmittingReply(true);
      const response = await coursePostService.createReply(post._id, {
        content: replyContent,
      });
      setReplies([...replies, response.data]);
      setReplyContent("");
      if (onReply) onReply();
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert(error.response?.data?.message || "Failed to submit reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleUpdateReply = async (replyId) => {
    if (!editReplyContent.trim()) return;

    try {
      const response = await coursePostService.updateReply(replyId, {
        content: editReplyContent,
      });
      setReplies(replies.map((r) => (r._id === replyId ? response.data : r)));
      setEditingReply(null);
      setEditReplyContent("");
    } catch (error) {
      console.error("Error updating reply:", error);
      alert(error.response?.data?.message || "Failed to update reply");
    }
  };

  const handleDeleteReply = (replyId) => {
    setReplyToDelete(replyId);
    setConfirmModalOpen(true);
  };

  const confirmDeleteReply = async () => {
    if (!replyToDelete) return;

    try {
      await coursePostService.deleteReply(replyToDelete);
      setReplies(replies.filter((r) => r._id !== replyToDelete));
      setReplyToDelete(null);
    } catch (error) {
      console.error("Error deleting reply:", error);
      alert(error.response?.data?.message || "Failed to delete reply");
    }
  };

  const handleTogglePin = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await coursePostService.togglePinPost(post._id);
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error("Error toggling pin:", error);
      alert(error.response?.data?.message || "Failed to toggle pin");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {post.isPinned && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 3a1 1 0 011 1v5h3a1 1 0 110 2h-3v5a1 1 0 11-2 0v-5H6a1 1 0 110-2h3V4a1 1 0 011-1z" />
                </svg>
                Pinned
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900">
              {post.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">
              {post.user.firstName} {post.user.lastName}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                getRoleBadge(post.user.role).classes
              }`}
            >
              {getRoleBadge(post.user.role).label}
            </span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
            {post.updatedAt !== post.createdAt && (
              <>
                <span>•</span>
                <span className="text-gray-500 italic">edited</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {(isOwner || isFaculty || isInstructor) && (
          <div className="flex items-center gap-1">
            {(isFaculty || isInstructor) && (
              <button
                onClick={handleTogglePin}
                className={`p-1 hover:bg-gray-100 rounded transition ${
                  post.isPinned
                    ? "text-primary-600 hover:text-primary-700"
                    : "text-gray-500 hover:text-primary-600"
                }`}
                title={post.isPinned ? "Unpin post" : "Pin post"}
              >
                {post.isPinned ? (
                  // Filled pin icon for pinned posts
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 12V4h1a1 1 0 000-2H7a1 1 0 000 2h1v8l-2 2v2h5.586l-.293.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 00-1.414 1.414l.293.293H6v-.586l2-2V4h8v8l2 2v.586h-5.586l.293-.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414l-.293-.293H20v-2l-2-2z" />
                  </svg>
                ) : (
                  // Outline pin icon for unpinned posts
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                )}
              </button>
            )}
            {isOwner && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit && onEdit(post);
                  }}
                  className="p-1 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded transition"
                  title="Edit post"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete && onDelete(post._id);
                  }}
                  className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition"
                  title="Delete post"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.content}</p>

      {/* Reply Button */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
        <button
          onClick={handleToggleReplies}
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {showReplies ? "Hide" : "Show"} Replies ({post.replyCount || 0})
        </button>
      </div>

      {/* Replies Section */}
      {showReplies && (
        <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
          {loadingReplies ? (
            <p className="text-sm text-gray-500">Loading replies...</p>
          ) : (
            <>
              {replies.map((reply) => (
                <div key={reply._id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-900">
                        {reply.user.firstName} {reply.user.lastName}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          getRoleBadge(reply.user.role).classes
                        }`}
                      >
                        {getRoleBadge(reply.user.role).label}
                      </span>
                      <span className="text-gray-500">
                        {formatDistanceToNow(new Date(reply.createdAt))} ago
                      </span>
                      {reply.updatedAt !== reply.createdAt && (
                        <span className="text-gray-400 italic text-xs">
                          (edited)
                        </span>
                      )}
                    </div>
                    {(currentUser?.id === reply.user._id ||
                      isFaculty ||
                      isInstructor) && (
                      <div className="flex items-center gap-1">
                        {currentUser?.id === reply.user._id && (
                          <button
                            onClick={() => {
                              setEditingReply(reply._id);
                              setEditReplyContent(reply.content);
                            }}
                            className="p-1 text-gray-500 hover:text-primary-600 rounded"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReply(reply._id)}
                          className="p-1 text-gray-500 hover:text-red-600 rounded"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  {editingReply === reply._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editReplyContent}
                        onChange={(e) => setEditReplyContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        rows="2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateReply(reply._id)}
                          className="px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingReply(null);
                            setEditReplyContent("");
                          }}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {reply.content}
                    </p>
                  )}
                </div>
              ))}

              {/* Reply Form */}
              <form onSubmit={handleSubmitReply} className="space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  rows="2"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingReply || !replyContent.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {submittingReply ? "Posting..." : "Post Reply"}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Confirm Delete Reply Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setReplyToDelete(null);
        }}
        onConfirm={confirmDeleteReply}
        title="Delete Reply"
        message="Are you sure you want to delete this reply? This action cannot be undone."
      />
    </div>
  );
}

PostCard.propTypes = {
  post: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onPostUpdated: PropTypes.func,
  onDelete: PropTypes.func,
  onReply: PropTypes.func,
  courseInstructor: PropTypes.object,
};

export default PostCard;
