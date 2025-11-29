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
import { MobileNav } from "@/components/ui/mobile-nav";

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
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${badgeClass}`}>
              {post.type === "question" ? "❓ Question" : "🎉 Success Story"}
            </span>
            {post.subject && post.type === "question" && (
              <span className="text-xs text-neutral-600 bg-neutral-100/80 px-2 py-1 rounded border border-neutral-200">
                {post.subject}
              </span>
            )}
          </div>
          {post.isOwner && !isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-neutral-500 hover:text-blue-500 transition-colors p-1 hover:bg-blue-50 rounded-full"
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
                className="text-neutral-500 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"
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
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <img
                src={post.user.avatar}
                alt={post.user.name}
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
              <div className="absolute inset-0 rounded-full ring-1 ring-black/5"></div>
            </div>
            <div>
              <span className="text-sm font-semibold text-neutral-900 block">{post.user.name}</span>
              <span className="text-xs text-neutral-500">
                {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4 bg-white/50 p-4 rounded-lg border border-white/20">
            <input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full border border-neutral-200 bg-white/80 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Title"
            />
            {post.type === "question" && (
              <input
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                className="w-full border border-neutral-200 bg-white/80 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Subject (optional)"
              />
            )}
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full border border-neutral-200 bg-white/80 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
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
                className="bg-white hover:bg-neutral-50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={!editedTitle || !editedContent || updateMutation.isPending}
                className="bg-gradient-to-r from-primary to-purple-600 text-white shadow-md hover:shadow-lg transition-all"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Title */}
            <h3 className="text-xl font-bold text-neutral-900 mb-3 leading-tight">{post.title}</h3>

            {/* Content */}
            <p className="text-neutral-700 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>

            {/* Image */}
            {post.imageUrl && (
              <div className="mb-4 rounded-xl overflow-hidden shadow-sm border border-neutral-100">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full object-cover max-h-96 hover:scale-[1.02] transition-transform duration-500"
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
            <div className="flex items-center justify-between pt-4 border-t border-neutral-100/50">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${post.hasLiked
                    ? 'bg-red-50 text-red-500 shadow-sm ring-1 ring-red-100'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-red-500'
                    }`}
                  aria-label="Like"
                  title={post.hasLiked ? "Unlike" : "Like"}
                >
                  <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-current' : ''}`} />
                  <span>{post.likes}</span>
                </button>
                <button
                  onClick={handleCommentClick}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${showComments
                    ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-blue-600'
                    }`}
                  aria-label={post.type === "question" ? "Answers" : "Comments"}
                  title={post.type === "question" ? "View answers" : "View comments"}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.commentCount || 0}</span>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 pt-4 border-t border-neutral-100/50 animate-in slide-in-from-top-2 duration-200">
                <h4 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  {post.type === "question" ? "Answers" : "Comments"}
                  <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full text-xs">{comments.length}</span>
                </h4>

                {/* Comment input */}
                <div className="mb-6">
                  <div className="flex gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserId}`}
                      alt="Your avatar"
                      className="w-8 h-8 rounded-full border border-neutral-200 hidden sm:block"
                    />
                    <div className="flex-1 flex gap-2">
                      <input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={post.type === "question" ? "Write your answer..." : "Write a comment..."}
                        className="flex-1 border border-neutral-200 bg-neutral-50/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
                            e.preventDefault();
                            commentMutation.mutate();
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        className="rounded-full w-9 h-9 bg-primary hover:bg-primary/90 shadow-sm"
                        onClick={() => commentMutation.mutate()}
                        disabled={!commentText.trim() || commentMutation.isPending}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Comments list */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-6 bg-neutral-50/50 rounded-lg border border-dashed border-neutral-200">
                      <p className="text-sm text-neutral-500">
                        {post.type === "question" ? "No answers yet. Be the first to answer!" : "No comments yet. Be the first to comment!"}
                      </p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="group flex gap-3">
                        {comment.user && (
                          <img
                            src={comment.user.avatar}
                            alt={comment.user.name}
                            className="w-8 h-8 rounded-full border border-neutral-100 mt-1"
                          />
                        )}
                        <div className="flex-1">
                          <div className="bg-neutral-50/80 rounded-2xl rounded-tl-none px-4 py-3 border border-neutral-100/50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-neutral-900">
                                {comment.user?.name}
                              </span>
                              <span className="text-xs text-neutral-400">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-4 mt-1 ml-2">
                            {/* Show delete button only if current user is the comment owner */}
                            {comment.userId === currentUserId && (
                              <button
                                onClick={() => {
                                  if (confirm("Delete this comment?")) {
                                    deleteCommentMutation.mutate(comment.id);
                                  }
                                }}
                                className="text-xs text-neutral-400 hover:text-red-500 transition-colors font-medium opacity-0 group-hover:opacity-100"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
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
    <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-sm mb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
      <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
        <span className="bg-primary/10 p-2 rounded-lg text-primary">✏️</span>
        Create a Post
      </h3>

      {/* Type Selection */}
      <div className="flex p-1 bg-neutral-100/80 rounded-xl mb-6">
        <button
          onClick={() => setType("question")}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${type === "question"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-neutral-500 hover:text-neutral-700"
            }`}
        >
          ❓ Ask Question
        </button>
        <button
          onClick={() => setType("success")}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${type === "success"
            ? "bg-white text-green-600 shadow-sm"
            : "text-neutral-500 hover:text-neutral-700"
            }`}
        >
          🎉 Share Success
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border border-neutral-200 bg-white/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all text-lg font-medium placeholder:font-normal"
        />

        {type === "question" && (
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (optional, e.g., JavaScript, Python)"
            className="w-full border border-neutral-200 bg-white/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all"
          />
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={type === "question" ? "Describe your question in detail..." : "Share your success story with the community..."}
          className="w-full border border-neutral-200 bg-white/50 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all min-h-[120px]"
          rows={4}
        />

        {/* Image Upload */}
        <div>
          {imagePreview ? (
            <div className="relative inline-block group">
              <img src={imagePreview} alt="Preview" className="max-h-48 rounded-xl shadow-sm border border-neutral-200" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <button
                  onClick={removeImage}
                  className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transform hover:scale-110 transition-all"
                  title="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 rounded-lg border border-dashed border-neutral-300 hover:border-primary hover:bg-primary/5 text-neutral-500 hover:text-primary transition-all">
              <ImageIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Add an image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!title || !content || createMutation.isPending}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all px-8 rounded-full"
          >
            {createMutation.isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span> Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Post
              </>
            )}
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

  const navItems = [
    { label: 'Profile', icon: <User className="w-5 h-5 text-neutral-700" />, target: '/?tab=profile-tab' },
    { label: 'Feed', icon: <Newspaper className="w-5 h-5 text-neutral-700" />, target: '/feed', isActive: true },
    { label: 'Messages', icon: <MessageCircle className="w-5 h-5 text-neutral-700" />, target: '/messages' },
    { label: 'Skill Exchange', icon: <Repeat className="w-5 h-5 text-neutral-700" />, target: '/?tab=barter-tab' },
    { label: 'Points', icon: <CreditCard className="w-5 h-5 text-neutral-700" />, target: '/?tab=points-tab' },
    { label: 'Learn', icon: <GraduationCap className="w-5 h-5 text-neutral-700" />, target: '/?tab=learn-tab' },
    { label: 'Achievements', icon: <Trophy className="w-5 h-5 text-neutral-700" />, target: '/?tab=achievements-tab' },
    { label: 'Community', icon: <Users className="w-5 h-5 text-neutral-700" />, target: '/?tab=study-group-tab' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-wrap gap-3 mb-8 justify-center sm:justify-start">
        {navItems.map((item) => (
          <Link key={item.label} href={item.target}>
            <button
              className={`group flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${item.isActive
                ? 'bg-primary text-white shadow-lg scale-110 ring-4 ring-primary/20'
                : 'bg-white/40 backdrop-blur-sm border border-white/40 text-neutral-700 hover:bg-white/60 hover:scale-110 hover:shadow-lg'
                }`}
              aria-label={item.label}
              title={item.label}
            >
              {React.cloneElement(item.icon as React.ReactElement, {
                className: `h-6 w-6 ${item.isActive ? 'text-white' : 'group-hover:text-primary'} transition-colors`
              })}
            </button>
          </Link>
        ))}
      </div>

      <div className="glass-card rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="px-4 py-5 sm:px-6 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium leading-6 text-neutral-900">Community Feed</h3>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">Ask questions, share success stories, and connect with the community</p>
          </div>
        </div>

        <div className="p-6">
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
        </div>
      </div>
      <MobileNav setActiveTab={() => { }} activeTab="" />
    </div>
  );
}