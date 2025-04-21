"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import {
  Send,
  ThumbsUp,
  MessageSquare,
  MoreHorizontal,
  Reply,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommentData {
  id: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  replies?: CommentData[];
  isEdited?: boolean;
}

interface ArticleCommentsSectionProps {
  articleId: string;
  initialComments?: CommentData[];
}

const ArticleCommentsSection: React.FC<ArticleCommentsSectionProps> = ({
  articleId,
  initialComments = [],
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = isMounted ? resolvedTheme === "dark" : true;

  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Mock user data - in a real app, this would come from authentication
  const currentUser = {
    id: "user-1",
    name: "Current User",
    image: "/images/avatar-placeholder.jpg",
  };

  useEffect(() => {
    setIsMounted(true);

    // Simulate loading comments
    const fetchComments = async () => {
      // In a real app, this would be an API call
      // For demo, we'll use the initialComments or mock data
      if (initialComments.length === 0) {
        const mockComments: CommentData[] = [
          {
            id: "comment-1",
            author: {
              id: "author-1",
              name: "Jane Smith",
              image: "/images/avatar-1.jpg",
            },
            content:
              "This article was exactly what I needed! The section on performance optimization really helped me improve my app's loading time.",
            createdAt: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 2
            ).toISOString(), // 2 days ago
            likes: 5,
            isLiked: false,
            replies: [
              {
                id: "comment-2",
                author: {
                  id: "author-2",
                  name: "John Doe",
                  image: "/images/avatar-2.jpg",
                },
                content:
                  "I agree! I especially liked the code examples for lazy loading components.",
                createdAt: new Date(
                  Date.now() - 1000 * 60 * 60 * 12
                ).toISOString(), // 12 hours ago
                likes: 2,
                isLiked: true,
              },
            ],
          },
          {
            id: "comment-3",
            author: {
              id: "author-3",
              name: "Alex Johnson",
              image: "/images/avatar-3.jpg",
            },
            content:
              "Great article! I would love to see a follow-up about server-side rendering optimization techniques.",
            createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
            likes: 3,
            isLiked: false,
          },
        ];

        setComments(mockComments);
      }
    };

    fetchComments();
  }, [initialComments]);

  // Auto-focus the reply input when replying
  useEffect(() => {
    if (replyToId && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replyToId]);

  // Auto-focus and set content when editing
  useEffect(() => {
    if (editingId) {
      const commentToEdit = findComment(comments, editingId);
      if (commentToEdit) {
        setEditContent(commentToEdit.content);
      }
    }
  }, [editingId, comments]);

  // Helper function to find a comment by ID recursively
  const findComment = (
    commentsArray: CommentData[],
    id: string
  ): CommentData | null => {
    for (const comment of commentsArray) {
      if (comment.id === id) {
        return comment;
      }
      if (comment.replies) {
        const found = findComment(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper function to update a comment by ID recursively
  const updateComment = (
    commentsArray: CommentData[],
    id: string,
    updater: (comment: CommentData) => CommentData
  ): CommentData[] => {
    return commentsArray.map((comment) => {
      if (comment.id === id) {
        return updater(comment);
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateComment(comment.replies, id, updater),
        };
      }
      return comment;
    });
  };

  // Helper function to add a reply to a comment
  const addReplyToComment = (
    commentsArray: CommentData[],
    parentId: string,
    newReply: CommentData
  ): CommentData[] => {
    return commentsArray.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: addReplyToComment(comment.replies, parentId, newReply),
        };
      }
      return comment;
    });
  };

  // Handle submitting a new comment
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      // For demo, we'll just add the comment to state
      const newCommentData: CommentData = {
        id: `comment-${Date.now()}`,
        author: currentUser,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      };

      setComments((prev) => [...prev, newCommentData]);
      setNewComment("");

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      console.error("Error submitting comment:", err);
      setError("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle submitting a reply
  const handleSubmitReply = async (parentId: string, content: string) => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      const newReply: CommentData = {
        id: `comment-reply-${Date.now()}`,
        author: currentUser,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      };

      setComments((prev) => addReplyToComment(prev, parentId, newReply));
      setReplyToId(null);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      console.error("Error submitting reply:", err);
      setError("Failed to submit reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating a comment
  const handleUpdateComment = async (id: string) => {
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      setComments((prev) =>
        updateComment(prev, id, (comment) => ({
          ...comment,
          content: editContent.trim(),
          isEdited: true,
        }))
      );

      setEditingId(null);
      setEditContent("");

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      console.error("Error updating comment:", err);
      setError("Failed to update comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle liking a comment
  const handleLikeComment = async (id: string) => {
    setComments((prev) =>
      updateComment(prev, id, (comment) => ({
        ...comment,
        likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
        isLiked: !comment.isLiked,
      }))
    );

    // In a real app, this would trigger an API call
  };

  // Handle deleting a comment (placeholder - would need confirmation in real app)
  const handleDeleteComment = async (id: string) => {
    // Simplified for demo - in a real app, you'd want confirmation
    setComments((prev) => prev.filter((comment) => comment.id !== id));

    // For nested replies, a more complex filter would be needed
    // This is simplified for the demo
  };

  // Comment component for rendering individual comments
  const Comment: React.FC<{
    comment: CommentData;
    depth?: number;
    isReply?: boolean;
  }> = ({ comment, depth = 0, isReply = false }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef<HTMLDivElement>(null);

    // Close options menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          optionsRef.current &&
          !optionsRef.current.contains(event.target as Node)
        ) {
          setShowOptions(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const isAuthor = comment.author.id === currentUser.id;
    const isEditing = editingId === comment.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`mb-4 ${isReply ? "ml-8 md:ml-16" : ""}`}
      >
        <div
          className={`rounded-xl p-4 ${
            isDark
              ? isReply
                ? "bg-gray-900/50 border border-gray-800"
                : "bg-gray-900/80 border border-gray-800"
              : isReply
              ? "bg-gray-100/80"
              : "bg-white border border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Author Avatar */}
            <div className="flex-shrink-0">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                {comment.author.image ? (
                  <Image
                    src={comment.author.image}
                    alt={comment.author.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center text-white font-medium ${
                      isDark ? "bg-gray-700" : "bg-gray-500"
                    }`}
                  >
                    {comment.author.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-medium mr-2">
                    {comment.author.name}
                  </span>
                  <span
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                    {comment.isEdited && <span className="ml-1">(edited)</span>}
                  </span>
                </div>

                {/* Comment options */}
                <div className="relative" ref={optionsRef}>
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className={`p-1 rounded-full transition-colors ${
                      isDark ? "hover:bg-gray-800" : "hover:bg-gray-200"
                    }`}
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  <AnimatePresence>
                    {showOptions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 mt-1 w-36 z-10 rounded-lg shadow-lg ${
                          isDark
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <div className="py-1">
                          {isAuthor && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(comment.id);
                                  setShowOptions(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                                  isDark
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <Edit size={14} className="mr-2" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteComment(comment.id);
                                  setShowOptions(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center text-red-500 ${
                                  isDark
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <Trash2 size={14} className="mr-2" />
                                Delete
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setReplyToId(comment.id);
                              setShowOptions(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                              isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                            }`}
                          >
                            <Reply size={14} className="mr-2" />
                            Reply
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Comment Content */}
              {isEditing ? (
                <div className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    autoFocus
                    className={`w-full rounded-lg p-3 resize-none focus:outline-none focus:ring-1 ${
                      isDark
                        ? "bg-gray-800 border border-gray-700 focus:ring-primary-500"
                        : "bg-white border border-gray-300 focus:ring-primary-500"
                    }`}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent("");
                      }}
                      className={`px-3 py-1 rounded-md text-sm ${
                        isDark
                          ? "bg-gray-800 hover:bg-gray-700"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateComment(comment.id)}
                      className="px-3 py-1 rounded-md text-sm bg-primary hover:bg-primary-600 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  className={`whitespace-pre-wrap break-words ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {comment.content}
                </p>
              )}

              {/* Comment Actions */}
              <div className="mt-3 flex items-center gap-4">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className={`flex items-center gap-1.5 text-sm ${
                    comment.isLiked
                      ? "text-primary"
                      : isDark
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <ThumbsUp
                    size={14}
                    className={comment.isLiked ? "fill-primary" : ""}
                  />
                  <span>{comment.likes}</span>
                </button>

                <button
                  onClick={() => setReplyToId(comment.id)}
                  className={`flex items-center gap-1.5 text-sm ${
                    isDark
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Reply size={14} />
                  <span>Reply</span>
                </button>
              </div>

              {/* Reply Input */}
              <AnimatePresence>
                {replyToId === comment.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          {currentUser.image ? (
                            <Image
                              src={currentUser.image}
                              alt={currentUser.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div
                              className={`w-full h-full flex items-center justify-center text-white font-medium ${
                                isDark ? "bg-gray-700" : "bg-gray-500"
                              }`}
                            >
                              {currentUser.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <textarea
                          ref={replyInputRef}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className={`w-full rounded-lg p-3 resize-none focus:outline-none focus:ring-1 ${
                            isDark
                              ? "bg-gray-800 border border-gray-700 focus:ring-primary-500 placeholder-gray-500"
                              : "bg-white border border-gray-300 focus:ring-primary-500 placeholder-gray-400"
                          }`}
                          rows={2}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => {
                              setReplyToId(null);
                              setReplyContent("");
                            }}
                            className={`px-3 py-1 rounded-md text-sm ${
                              isDark
                                ? "bg-gray-800 hover:bg-gray-700"
                                : "bg-gray-200 hover:bg-gray-300"
                            }`}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              handleSubmitReply(comment.id, replyContent)
                            }
                            className="px-3 py-1 rounded-md text-sm bg-primary hover:bg-primary-600 text-white"
                            disabled={isSubmitting || !replyContent.trim()}
                          >
                            {isSubmitting ? "Posting..." : "Reply"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                isReply={true}
              />
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // If not mounted yet, render a simple loading state to avoid hydration issues
  if (!isMounted) {
    return (
      <div className="py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h3
        className={`text-xl font-medium mb-6 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        Comments{" "}
        <span className="text-gray-500 text-lg">({comments.length})</span>
      </h3>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 mb-4 rounded-lg text-sm flex items-center gap-2 ${
            isDark
              ? "bg-red-900/20 text-red-400 border border-red-900/50"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          <AlertTriangle size={16} />
          <span>{error}</span>
        </motion.div>
      )}

      {/* New comment form */}
      <div
        className={`mb-8 rounded-xl p-4 ${
          isDark
            ? "bg-gray-900/80 border border-gray-800"
            : "bg-white border border-gray-200 shadow-sm"
        }`}
      >
        <h4
          className={`text-sm font-medium mb-3 ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Add a comment
        </h4>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              {currentUser.image ? (
                <Image
                  src={currentUser.image}
                  alt={currentUser.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-white font-medium ${
                    isDark ? "bg-gray-700" : "bg-gray-500"
                  }`}
                >
                  {currentUser.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className={`w-full rounded-lg p-3 resize-none focus:outline-none focus:ring-1 ${
                isDark
                  ? "bg-gray-800 border border-gray-700 focus:ring-primary-500 placeholder-gray-500"
                  : "bg-white border border-gray-300 focus:ring-primary-500 placeholder-gray-400"
              }`}
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  newComment.trim()
                    ? "bg-primary hover:bg-primary-600 text-white"
                    : isDark
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Send size={16} />
                <span>{isSubmitting ? "Posting..." : "Post Comment"}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))
        ) : (
          <div
            className={`text-center py-8 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <MessageSquare size={28} className="mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleCommentsSection;
