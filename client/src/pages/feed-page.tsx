import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import {
  User, Repeat, CreditCard, GraduationCap, Trophy, Users, Newspaper, MessageCircle, UserPlus,
  Heart, Image as ImageIcon, X
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
};

function PostCard({ post }: { post: FeedPost }) {
  const queryClient = useQueryClient();

  const badgeClass = post.type === "question"
    ? "bg-blue-500 text-white"
    : "bg-green-500 text-white";

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/posts/${post.id}/like`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
            {post.type === "question" ? "❓ Question" : "🎉 Success Story"}
          </span>
          {post.subject && post.type === "question" && (
            <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
              {post.subject}
            </span>
          )}
        </div>

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

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <span className="text-xs text-neutral-500">
            {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={() => likeMutation.mutate()}
            className="flex items-center gap-1 text-sm text-neutral-600 hover:text-red-500 transition-colors"
            aria-label="Like"
          >
            <Heart className="w-4 h-4" />
            <span className="font-medium">{post.likes}</span>
          </button>
        </div>
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
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
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
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-600 hover:text-primary">
              <ImageIcon className="w-5 h-5" />
              <span>Add an image (optional)</span>
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
    {
      label: 'Profile',
      icon: <User className="w-5 h-5 text-neutral-700" />,
      target: '/',
      isRoute: true
    },
    {
      label: 'Feed',
      icon: <Newspaper className="w-5 h-5 text-neutral-700" />,
      target: '/feed',
      isRoute: true
    },
    {
      label: 'Messages',
      icon: <MessageCircle className="w-5 h-5 text-neutral-700" />,
      target: '/messages',
      isRoute: true
    },
    {
      label: 'Barter',
      icon: <Repeat className="w-5 h-5 text-neutral-700" />,
      target: '/',
      isRoute: true
    },
    {
      label: 'Points',
      icon: <CreditCard className="w-5 h-5 text-neutral-700" />,
      target: '/',
      isRoute: true
    },
    {
      label: 'Learn',
      icon: <GraduationCap className="w-5 h-5 text-neutral-700" />,
      target: '/',
      isRoute: true
    },
    {
      label: 'Achievements',
      icon: <Trophy className="w-5 h-5 text-neutral-700" />,
      target: '/',
      isRoute: true
    },
    {
      label: 'Community',
      icon: <Users className="w-5 h-5 text-neutral-700" />,
      target: '/',
      isRoute: true
    },
    {
      label: 'Find Friends',
      icon: <UserPlus className="w-5 h-5 text-neutral-700" />,
      target: '/find-friends',
      isRoute: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Icon-only navigation buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {navItems.map((item) => {
          const isActive = item.target === '/feed';
          return (
            <Link key={item.label} to={item.target}>
              <button
                className={`flex items-center justify-center w-12 h-12 rounded-md transition-all ${isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                  }`}
                aria-label={item.label}
              >
                {React.cloneElement(item.icon as React.ReactElement, {
                  className: `h-6 w-6 ${isActive ? 'text-white' : ''}`
                })}
              </button>
            </Link>
          );
        })}
      </div>

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
          posts.map(p => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
}