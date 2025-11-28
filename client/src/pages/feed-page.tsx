import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import {
  User, Repeat, CreditCard, GraduationCap, Trophy, Users, Newspaper, MessageCircle, UserPlus,
  Heart, Image as ImageIcon, X, Edit2, Trash2, Send, MessageSquare
} from "lucide-react";

type FeedPost = {
  id: number;
  userId: number;
  type: "question" | "success";
  title: string;
  subject?: string | null;
  content: string;
  imageUrl?: string | null;
  likes: number;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    avatar: string;
  };
  hasLiked?: boolean;
  commentCount?: number;
  isOwner?: boolean;
};

type Comment = {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    avatar: string;
  };
};

function PostCard({ post, currentUserId }: { post: FeedPost; currentUserId: number }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.title);
  const [editedContent, setEditedContent] = useState(post.content);
  const [editedSubject, setEditedSubject] = useState(post.subject || "");
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const badgeClass = post.type === "question"
    ? "bg-blue-500 text-white"
    : "bg-green-500 text-white";

  // Fetch comments when shown
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: [`/api/posts/${post.id}/comments`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/posts/${post.id}/comments`);
      return res.json();
    },
    enabled: showComments
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/posts/${post.id}/like`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to like post",
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/posts/${post.id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive"
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/posts/${post.id}`, {
        title: editedTitle,
        content: editedContent,
        subject: post.type === "question" ? editedSubject : undefined
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsEditing(false);
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update post.",
        variant: "destructive"
      });
    }
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/posts/${post.id}/comments`, {
        content: commentText
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setCommentText("");
      toast({
        title: post.type === "question" ? "Answer posted" : "Comment posted",
        description: `Your ${post.type === "question" ? "answer" : "comment"} has been added.`
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest("DELETE", `/api/posts/${post.id}/comments/${commentId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: post.type === "question" ? "Answer deleted" : "Comment deleted",
        description: "Deleted successfully."
      });
    },
  });

  const handleCommentClick = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
              {post.type === "question" ? "❓ Question" : "🎉 Success Story"}
            </span>
            {post.subject && post.type === "question" && (
              <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                {post.subject}
              </span>
            )}
          </div>
          {post.isOwner && !isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-neutral-500 hover:text-blue-500 transition-colors"
                aria-label="Edit"
                title="Edit post"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this post?")) {
                    deleteMutation.mutate();
                  }
                }}
                className="text-neutral-500 hover:text-red-500 transition-colors"
                aria-label="Delete"
                title="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* User info */}
        {post.user && (
          <div className="flex items-center gap-2 mb-3">
            <img
              src={post.user.avatar}
              alt={post.user.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium text-neutral-700">{post.user.name}</span>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-3">
            <input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Title"
            />
            {post.type === "question" && (
              <input
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Subject (optional)"
              />
            )}
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="Content"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditedTitle(post.title);
                  setEditedContent(post.content);
                  setEditedSubject(post.subject || "");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={!editedTitle || !editedContent || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Title */}
            <h3 className="text-lg font-bold text-neutral-900 mb-2">{post.title}</h3>

            {/* Content */}
            <p className="text-sm text-neutral-700 mb-3 whitespace-pre-wrap">{post.content}</p>

            {/* Image */}
            {post.imageUrl && (
              <div className="mb-3 rounded-lg overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full object-cover max-h-80"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* Footer */}
        {!isEditing && (
          <>
            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              <span className="text-xs text-neutral-500">
                {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleCommentClick}
                  className="flex items-center gap-1 text-sm text-neutral-600 hover:text-blue-500 transition-colors"
                  aria-label={post.type === "question" ? "Answers" : "Comments"}
                  title={post.type === "question" ? "View answers" : "View comments"}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">{post.commentCount || 0}</span>
                </button>
                <button
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className={`flex items-center gap-1 text-sm transition-colors ${post.hasLiked ? 'text-red-500' : 'text-neutral-600 hover:text-red-500'
                    }`}
                  aria-label="Like"
                  title={post.hasLiked ? "Unlike" : "Like"}
                >
                  <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{post.likes}</span>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">
                  {post.type === "question" ? "Answers" : "Comments"} ({comments.length})
                </h4>

                {/* Comment input */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={post.type === "question" ? "Write your answer..." : "Write a comment..."}
                      className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
                          e.preventDefault();
                          commentMutation.mutate();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => commentMutation.mutate()}
                      disabled={!commentText.trim() || commentMutation.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Comments list */}
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <p className="text-sm text-neutral-500 text-center py-4">
                      {post.type === "question" ? "No answers yet. Be the first to answer!" : "No comments yet. Be the first to comment!"}
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-neutral-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 mb-2">
                            {comment.user && (
                              <>
                                <img
                                  src={comment.user.avatar}
                                  alt={comment.user.name}
                                  className="w-6 h-6 rounded-full"
                                />
                                <span className="text-xs font-medium text-neutral-700">
                                  {comment.user.name}
                                </span>
                              </>
                            )}
                            <span className="text-xs text-neutral-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {/* Show delete button only if current user is the comment owner */}
                          {comment.userId === currentUserId && (
                            <button
                              onClick={() => {
                                if (confirm("Delete this comment?")) {
                                  deleteCommentMutation.mutate(comment.id);
                                }
                              }}
                              className="text-neutral-400 hover:text-red-500 transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-neutral-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PostForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [type, setType] = useState<"question" | "success">("question");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const createMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = imagePreview;

      const res = await apiRequest("POST", "/api/posts", {
        type,
        title,
        subject: type === "question" && subject ? subject : undefined,
        content,
        imageUrl
      });
      return res.json();
    },
    onSuccess: () => {
      setTitle("");
      setSubject("");
      setContent("");
      setImageFile(null);
      setImagePreview("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created",
        description: "Your post has been shared with the community."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create post",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Image too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "Failed to read the image file",
          variant: "destructive"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Create a Post</h3>

      {/* Type Selection */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setType("question")}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${type === "question"
            ? "bg-blue-500 text-white"
            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
        >
          ❓ Ask Question
        </button>
        <button
          onClick={() => setType("success")}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${type === "success"
            ? "bg-green-500 text-white"
            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
        >
          🎉 Share Success
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {type === "question" && (
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (optional, e.g., JavaScript, Python)"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={type === "question" ? "Describe your question..." : "Share your success story..."}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          rows={4}
        />

        {/* Image Upload */}
        <div>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg" />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-600 hover:text-primary">
              <ImageIcon className="w-5 h-5" />
              <span>Add an image (optional, max 5MB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!title || !content || createMutation.isPending}
          >
            {createMutation.isPending ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const [typeFilter, setTypeFilter] = useState<"all" | "question" | "success">("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const queryKey = ["/api/posts", { typeFilter, subjectFilter }];
  const { data: posts = [] as FeedPost[] } = useQuery<FeedPost[]>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (subjectFilter) params.set("subject", subjectFilter);
      const res = await apiRequest("GET", `/api/posts?${params.toString()}`);
      return res.json();
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Community Feed</h1>
      <p className="text-sm text-neutral-600 mb-6">Ask questions, share success stories, and connect with the community</p>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex gap-2 items-center">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${typeFilter === "all"
              ? "bg-primary text-white"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            onClick={() => setTypeFilter("all")}
          >
            All Posts
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${typeFilter === "question"
              ? "bg-blue-500 text-white"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            onClick={() => setTypeFilter("question")}
          >
            Questions
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${typeFilter === "success"
              ? "bg-green-500 text-white"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            onClick={() => setTypeFilter("success")}
          >
            Success Stories
          </button>
        </div>
        <input
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          placeholder="Filter by subject (e.g., JavaScript)"
          className="border border-neutral-300 rounded-lg px-3 py-2 md:w-64 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 gap-6">
        <PostForm />
        {posts.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
            <p className="text-neutral-600">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map(p => <PostCard key={p.id} post={p} currentUserId={user?.id || 0} />)
        )}
      </div>
    </div >
  );
}