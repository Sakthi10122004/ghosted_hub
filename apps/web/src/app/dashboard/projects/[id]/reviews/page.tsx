"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Clock, Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function ProjectReviewsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", projectId],
    queryFn: () => fetchApi<{ data: any[] }>(`/projects/${projectId}/reviews`),
  });

  const reviews = Array.isArray(data?.data) ? data.data : [];

  const requestMutation = useMutation({
    mutationFn: (reviewData: { title: string; description: string; category: string }) =>
      fetchApi(`/projects/${projectId}/reviews`, {
        method: "POST",
        body: JSON.stringify(reviewData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", projectId] });
      setIsRequestOpen(false);
      setTitle("");
      setDescription("");
    },
  });

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    requestMutation.mutate({ title, description, category: "DESIGN" });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "FINAL_APPROVED":
        return <CheckCircle2 className="h-5 w-5 text-status-on-track" />;
      case "NEEDS_CHANGES":
      case "REVISION":
        return <XCircle className="h-5 w-5 text-status-at-risk" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "FINAL_APPROVED":
        return <Badge className="bg-status-on-track/20 text-status-on-track hover:bg-status-on-track/30 border-none uppercase text-[10px]">Approved</Badge>;
      case "NEEDS_CHANGES":
      case "REVISION":
        return <Badge className="bg-status-at-risk/20 text-status-at-risk hover:bg-status-at-risk/30 border-none uppercase text-[10px]">Changes Requested</Badge>;
      default:
        return <Badge variant="outline" className="uppercase text-[10px] text-muted-foreground">Pending Review</Badge>;
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Reviews</h2>
        <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
          <DialogTrigger asChild>
            <Button>Request Review</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request a Review</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRequest} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Homepage Design Final"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Notes / Details</Label>
                <Textarea
                  id="description"
                  placeholder="What specifically should we review?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={!title.trim() || requestMutation.isPending}>
                  {requestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reviews..." className="pl-9 bg-background" />
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted bg-background">All</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-muted-foreground">Pending</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-muted-foreground">Completed</Badge>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48 border-dashed border-2 m-6 rounded-lg text-muted-foreground bg-muted/20">
              <p>No reviews have been requested yet.</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">{getStatusIcon(review.status)}</div>
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-3">
                        {review.title}
                        {getStatusBadge(review.status)}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {review.description || "No description provided."}
                      </p>
                      <div className="flex items-center gap-4 mt-4 text-xs font-mono uppercase text-muted-foreground">
                        <span className="flex items-center gap-1">
                          Category: {review.category}
                        </span>
                        <span>•</span>
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
