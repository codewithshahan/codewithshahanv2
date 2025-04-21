import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import {
  MessageSquare,
  ThumbsUp,
  Reply,
  MoreHorizontal,
  Send,
  Smile,
  Image as ImageIcon,
  AtSign,
  AlertCircle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    role?: "admin" | "moderator" | "member";
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface ArticleCommentsProps {
  articleId: string;
  initialComments?: Comment[];
}

const ArticleComments: React.FC<ArticleCommentsProps> = ({
  articleId,
  initialComments = [],
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "popular">("newest");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { resolvedTheme } = useTheme();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const isDark = resolvedTheme === "dark";

  // Sample emoji set for the picker
  const emojiSet = [
    "😀",
    "👍",
    "❤️",
    "🎉",
    "🤔",
    "😂",
    "🙌",
    "👏",
    "🔥",
    "💯",
    "✨",
    "🚀",
  ];

  // Click outside emoji picker handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Submit comment handler
  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      if (replyingTo) {
        // Add reply to existing comment
        const newComments = comments.map((comment) => {
          if (comment.id === replyingTo) {
            return {
              ...comment,
              replies: [
                ...(comment.replies || []),
                {
                  id: `reply-${Date.now()}`,
                  author: {
                    name: "Current User",
                    avatar: "/images/avatars/default-avatar.jpg",
                    role: "member",
                  },
                  content: newComment,
                  timestamp: new Date().toISOString(),
                  likes: 0,
                  isLiked: false,
                },
              ],
            };
          }
          return comment;
        });

        setComments(newComments);
        setReplyingTo(null);
      } else {
        // Add new top-level comment
        const newCommentObj: Comment = {
          id: `comment-${Date.now()}`,
          author: {
            name: "Current User",
            avatar: "/images/avatars/default-avatar.jpg",
            role: "member",
          },
          content: newComment,
          timestamp: new Date().toISOString(),
          likes: 0,
          isLiked: false,
          replies: [],
        };

        setComments([newCommentObj, ...comments]);
      }

      setNewComment("");
      setIsSubmitting(false);
    }, 600);
  };

  // Like comment handler
  const handleLikeComment = (
    commentId: string,
    isReply: boolean = false,
    parentId?: string
  ) => {
    if (isReply && parentId) {
      // Handle liking a reply
      setComments(
        comments.map((comment) => {
          if (comment.id === parentId && comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                    isLiked: !reply.isLiked,
                  };
                }
                return reply;
              }),
            };
          }
          return comment;
        })
      );
    } else {
      // Handle liking a top-level comment
      setComments(
        comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !comment.isLiked,
            };
          }
          return comment;
        })
      );
    }
  };

  // Reply to comment handler
  const handleReplyClick = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);

    // Focus the comment input when reply is clicked
    if (replyingTo !== commentId) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
    }
  };

  // Insert emoji handler
  const handleEmojiClick = (emoji: string) => {
    setNewComment((prev) => prev + emoji);
    setShowEmojiPicker(false);
    commentInputRef.current?.focus();
  };

  // Sort comments
  const sortedComments = [...comments].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else {
      return b.likes - a.likes;
    }
  });

  // Animation variants
  const commentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="mt-12">
      {/* Comments Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center">
          <MessageSquare className="mr-2 text-primary" size={22} />
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Discussion ({comments.length})
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Sort by:
          </span>
          <motion.select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as "newest" | "popular")
            }
            className={`py-1 px-2 rounded-md text-sm ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            } border`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Liked</option>
          </motion.select>
        </div>
      </motion.div>

      {/* Comment Input */}
      <motion.div
        className={`mb-8 rounded-xl overflow-hidden border ${
          isDark
            ? "bg-gray-900/70 backdrop-blur-sm border-gray-800"
            : "bg-white border-gray-200 shadow-sm"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-4">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <Image
                src="/images/avatars/default-avatar.jpg"
                alt="User"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            </div>

            <div className="flex-grow">
              <textarea
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  replyingTo ? "Write a reply..." : "Share your thoughts..."
                }
                className={`w-full rounded-lg p-3 mb-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary ${
                  isDark
                    ? "bg-gray-800 text-white placeholder-gray-400 border-gray-700"
                    : "bg-gray-50 text-gray-900 placeholder-gray-500 border-gray-200"
                } border min-h-[80px]`}
                rows={3}
              />

              {replyingTo && (
                <div className="flex items-center mb-3 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm">
                  <span className="mr-2">Replying to comment</span>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="ml-auto p-1 rounded-full hover:bg-gray-800/20"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <div className="relative">
                    <motion.button
                      className={`p-2 rounded-full ${
                        isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile
                        size={18}
                        className={isDark ? "text-gray-400" : "text-gray-500"}
                      />
                    </motion.button>

                    {/* Emoji Picker */}
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          ref={emojiPickerRef}
                          className={`absolute bottom-10 left-0 p-2 rounded-lg shadow-lg z-10 border grid grid-cols-6 gap-1 ${
                            isDark
                              ? "bg-gray-800 border-gray-700"
                              : "bg-white border-gray-200"
                          }`}
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          {emojiSet.map((emoji) => (
                            <motion.button
                              key={emoji}
                              className="p-1.5 text-xl rounded hover:bg-primary/10"
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEmojiClick(emoji)}
                            >
                              {emoji}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button
                    className={`p-2 rounded-full ${
                      isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ImageIcon
                      size={18}
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    />
                  </motion.button>

                  <motion.button
                    className={`p-2 rounded-full ${
                      isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <AtSign
                      size={18}
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    />
                  </motion.button>
                </div>

                <motion.button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    newComment.trim()
                      ? "bg-primary text-white hover:bg-primary/90"
                      : isDark
                      ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  } transition-colors`}
                  whileHover={newComment.trim() ? { scale: 1.05 } : {}}
                  whileTap={newComment.trim() ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  ) : (
                    <>
                      <Send size={16} className="mr-1.5" />
                      <span>{replyingTo ? "Reply" : "Comment"}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Comments List */}
      {sortedComments.length > 0 ? (
        <motion.div
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {sortedComments.map((comment, index) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              index={index}
              onLike={handleLikeComment}
              onReply={handleReplyClick}
              replyingTo={replyingTo}
              isDark={isDark}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          className={`p-8 text-center rounded-xl ${
            isDark ? "bg-gray-900/70" : "bg-gray-50"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <MessageSquare className="mx-auto mb-3 opacity-40" size={30} />
          <p className={isDark ? "text-gray-400" : "text-gray-500"}>
            Be the first to share your thoughts!
          </p>
        </motion.div>
      )}
    </div>
  );
};

// Individual comment component
const CommentItem = ({
  comment,
  index,
  onLike,
  onReply,
  replyingTo,
  isDark,
  isReply = false,
  parentId,
}: {
  comment: Comment;
  index: number;
  onLike: (id: string, isReply?: boolean, parentId?: string) => void;
  onReply: (id: string) => void;
  replyingTo: string | null;
  isDark: boolean;
  isReply?: boolean;
  parentId?: string;
}) => {
  const [showReplies, setShowReplies] = useState(true);
  const hasReplies = comment.replies && comment.replies.length > 0;

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    const years = Math.floor(months / 12);
    return `${years}y ago`;
  };

  return (
    <motion.div
      custom={index}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.1,
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
          },
        }),
      }}
      className={`${isReply ? "ml-12 mt-4" : ""}`}
    >
      <div
        className={`p-4 rounded-xl ${
          isDark
            ? "bg-gray-900/70 backdrop-blur-sm border border-gray-800"
            : "bg-white border border-gray-200 shadow-sm"
        }`}
      >
        {/* Comment Header */}
        <div className="flex items-start space-x-3">
          <Image
            src={comment.author.avatar}
            alt={comment.author.name}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />

          <div className="flex-grow">
            <div className="flex items-center">
              <h4
                className={`font-medium ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {comment.author.name}
              </h4>

              {comment.author.role && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    comment.author.role === "admin"
                      ? "bg-purple-500/10 text-purple-500"
                      : comment.author.role === "moderator"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-gray-500/10 text-gray-500"
                  }`}
                >
                  {comment.author.role}
                </span>
              )}

              <span
                className={`ml-2 text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {formatRelativeTime(comment.timestamp)}
              </span>
            </div>

            <div
              className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {comment.content}
            </div>

            {/* Comment Actions */}
            <div className="mt-3 flex items-center space-x-4">
              <motion.button
                className={`flex items-center text-sm ${
                  comment.isLiked
                    ? "text-primary"
                    : isDark
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onLike(comment.id, isReply, parentId)}
              >
                <ThumbsUp
                  size={15}
                  className={`mr-1.5 ${comment.isLiked ? "fill-current" : ""}`}
                />
                <span>{comment.likes || ""}</span>
              </motion.button>

              <motion.button
                className={`flex items-center text-sm ${
                  replyingTo === comment.id
                    ? "text-primary"
                    : isDark
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onReply(comment.id)}
              >
                <Reply size={15} className="mr-1.5" />
                <span>Reply</span>
              </motion.button>

              <motion.button
                className={`flex items-center text-sm ${
                  isDark
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <MoreHorizontal size={15} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {hasReplies && (
        <div className="mt-2">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className={`flex items-center text-sm mb-2 px-3 py-1 rounded-full ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-800/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {showReplies ? (
              <ChevronUp size={14} className="mr-1" />
            ) : (
              <ChevronDown size={14} className="mr-1" />
            )}
            <span>
              {comment.replies!.length}{" "}
              {comment.replies!.length === 1 ? "reply" : "replies"}
            </span>
          </button>

          <AnimatePresence>
            {showReplies && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {comment.replies!.map((reply, replyIndex) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    index={replyIndex}
                    onLike={onLike}
                    onReply={onReply}
                    replyingTo={replyingTo}
                    isDark={isDark}
                    isReply={true}
                    parentId={comment.id}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default ArticleComments;
