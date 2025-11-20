import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

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
  const badgeClass = post.type === "question" ? "bg-primary text-white" : "bg-accent text-accent-foreground";
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-md text-xs ${badgeClass}`}>{post.type === "question" ? "Question" : "Success"}</span>
        {post.subject && <span className="text-xs text-neutral-600">{post.subject}</span>}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-neutral-900">{post.title}</h3>
      <p className="mt-2 text-sm text-neutral-700">{post.content}</p>
      {post.imageUrl && (
        <div className="mt-3">
          <img src={post.imageUrl} alt={post.title} className="w-full rounded-md object-cover max-h-64" />
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-neutral-500">{new Date(post.createdAt).toLocaleString()}</span>
        <LikeButton postId={post.id} likes={post.likes} />
      </div>
    </div>
  );
}

function LikeButton({ postId, likes }: { postId: number; likes: number }) {
  const queryClient = useQueryClient();
  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "PUT", headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error("Failed to like post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });
  return (
    <button onClick={() => likeMutation.mutate()} className="text-sm text-primary hover:underline" aria-label="Like">
      ❤️ {likes}
    </button>
  );
}

function PostForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [type, setType] = useState<"question" | "success">("question");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, subject, content, imageUrl }),
      });
      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: () => {
      setTitle(""); setSubject(""); setContent(""); setImageUrl("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
      <div className="flex flex-col md:flex-row gap-3">
        <select value={type} onChange={(e) => setType(e.target.value as any)} className="border rounded-md px-3 py-2">
          <option value="question">Question</option>
          <option value="success">Success</option>
        </select>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="border rounded-md px-3 py-2 flex-1" />
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (optional)" className="border rounded-md px-3 py-2 flex-1" />
      </div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your question or success story" className="mt-3 border rounded-md px-3 py-2 w-full" rows={4} />
      <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (optional)" className="mt-3 border rounded-md px-3 py-2 w-full" />
      <div className="mt-3 flex justify-end">
        <Button onClick={() => createMutation.mutate()} disabled={!title || !content}>
          Post
        </Button>
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
      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Community Feed</h1>
      <p className="text-sm text-neutral-600">Mixed posts: questions and success stories</p>

      <div className="mt-4 flex flex-col md:flex-row gap-3">
        <div className="flex gap-2 items-center">
          <button className={`px-3 py-1 rounded-md text-sm ${typeFilter === "all" ? "bg-primary text-white" : "bg-neutral-100"}`} onClick={() => setTypeFilter("all")}>All</button>
          <button className={`px-3 py-1 rounded-md text-sm ${typeFilter === "question" ? "bg-primary text-white" : "bg-neutral-100"}`} onClick={() => setTypeFilter("question")}>Questions</button>
          <button className={`px-3 py-1 rounded-md text-sm ${typeFilter === "success" ? "bg-primary text-white" : "bg-neutral-100"}`} onClick={() => setTypeFilter("success")}>Success</button>
        </div>
        <input value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} placeholder="Filter by subject" className="border rounded-md px-3 py-2 md:w-64" />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <PostForm />
        </div>
        {posts.map(p => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}