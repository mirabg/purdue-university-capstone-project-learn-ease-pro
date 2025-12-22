import { useState } from "react";
import PropTypes from "prop-types";
import { formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/slices/authSlice";
import {
  useGetRepliesQuery,
  useCreateReplyMutation,
  useUpdateReplyMutation,
  useDeleteReplyMutation,
  useTogglePinPostMutation,
} from "@/store/apiSlice";
import ConfirmModal from "./ConfirmModal";
import Icon from "@components/Icon";

function PostCard({
  post,
  onEdit,
  onPostUpdated,
  onDelete,
  onReply,
  courseInstructor,
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [replyToDelete, setReplyToDelete] = useState(null);
  const [error, setError] = useState(null);

  const currentUser = useSelector(selectUser);
  const isFaculty = currentUser?.role === "faculty";
  const currentUserId = currentUser?.id || currentUser?._id;
  const isOwner = currentUserId === post.user._id;
  const isInstructor = currentUserId === courseInstructor?._id;

  // RTK Query hooks
  const { data: repliesData, isLoading: loadingReplies } = useGetRepliesQuery(
    post._id,
    { skip: !showReplies }
  );
  const [createReply, { isLoading: submittingReply }] =
    useCreateReplyMutation();
  const [updateReply] = useUpdateReplyMutation();
  const [deleteReply] = useDeleteReplyMutation();
  const [togglePinPost] = useTogglePinPostMutation();

  const replies = repliesData?.data || [];

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

  const handleToggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setError(null);
      await createReply({ postId: post._id, content: replyContent }).unwrap();
      setReplyContent("");
      if (onReply) onReply();
    } catch (error) {
      console.error("Error submitting reply:", error);
      setError(error.data?.message || "Failed to submit reply");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdateReply = async (replyId) => {
    if (!editReplyContent.trim()) return;

    try {
      setError(null);
      await updateReply({
        replyId,
        content: editReplyContent,
      }).unwrap();
      setEditingReply(null);
      setEditReplyContent("");
    } catch (error) {
      console.error("Error updating reply:", error);
      setError(error.data?.message || "Failed to update reply");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteReply = (replyId) => {
    setReplyToDelete(replyId);
    setConfirmModalOpen(true);
  };

  const confirmDeleteReply = async () => {
    if (!replyToDelete) return;

    try {
      setError(null);
      await deleteReply(replyToDelete).unwrap();
      setReplyToDelete(null);
    } catch (error) {
      console.error("Error deleting reply:", error);
      setError(error.data?.message || "Failed to delete reply");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleTogglePin = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setError(null);
      await togglePinPost(post._id).unwrap();
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error("Error toggling pin:", error);
      setError(error.data?.message || "Failed to toggle pin");
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      {/* Error message */}
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-start">
            <Icon
              name="error"
              className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5"
            />
            <p className="ml-2 text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Post Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {post.isPinned && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                <Icon name="pin-small" className="w-3 h-3 mr-1" />
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
                  <Icon name="pin-filled" className="w-5 h-5" />
                ) : (
                  // Outline pin icon for unpinned posts
                  <Icon name="pin-outline" className="w-5 h-5" />
                )}
              </button>
            )}
            {(isOwner || isFaculty || isInstructor) && (
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
                  <Icon name="edit" className="w-5 h-5" />
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
                  <Icon name="delete" className="w-5 h-5" />
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
          <Icon name="chat-reply" className="w-4 h-4" />
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
                    {(currentUserId === reply.user._id ||
                      isFaculty ||
                      isInstructor) && (
                      <div className="flex items-center gap-1">
                        {(currentUserId === reply.user._id ||
                          isFaculty ||
                          isInstructor) && (
                          <button
                            onClick={() => {
                              setEditingReply(reply._id);
                              setEditReplyContent(reply.content);
                            }}
                            className="p-1 text-gray-500 hover:text-primary-600 rounded"
                            title="Edit reply"
                          >
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReply(reply._id)}
                          className="p-1 text-gray-500 hover:text-red-600 rounded"
                          title="Delete reply"
                        >
                          <Icon name="delete" className="w-4 h-4" />
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
