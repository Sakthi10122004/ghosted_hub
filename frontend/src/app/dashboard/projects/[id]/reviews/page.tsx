"use client";

import { motion } from "motion/react";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
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
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [adminFeedback, setAdminFeedback] = useState("");
  const [adminStatus, setAdminStatus] = useState("APPROVED");

  const { data, isLoading: isReviewsLoading } = useQuery({
    queryKey: ["reviews", projectId],
    queryFn: () => fetchApi<{ data: any[] }>(`/projects/${projectId}/reviews`),
  });

  const { data: projectData, isLoading: isProjectLoading } = useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => fetchApi<any>(`/projects/${projectId}`),
  });

  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const isStudentMember = projectData?.team?.members?.some((m: any) => m.userId === userId || m.user?.id === userId);
  const showRequestButton = isStudentMember;

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

  const reviewActionMutation = useMutation({
    mutationFn: (data: { status: string; feedback: string }) =>
      fetchApi(`/projects/${projectId}/reviews/${selectedReview.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", projectId] });
      setSelectedReview(null);
      setAdminFeedback("");
    },
  });

  const submitReviewAction = (e: React.FormEvent) => {
    e.preventDefault();
    reviewActionMutation.mutate({ status: adminStatus, feedback: adminFeedback });
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

  if (isReviewsLoading || isProjectLoading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Reviews</h2>
        {showRequestButton && (
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
        )}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reviews..." className="pl-9 bg-background shadow-sm" />
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted bg-background">All</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-muted-foreground">Pending</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-muted-foreground">Completed</Badge>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >
        {reviews.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center h-48 border-dashed border-2 m-6 rounded-lg text-muted-foreground bg-muted/20">
              <p>No reviews have been requested yet.</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review: any) => (
            <motion.div
              key={review.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className="flex flex-col h-full border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(review.status)}
                      {getStatusBadge(review.status)}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-serif font-semibold text-lg mb-2">{review.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                    {review.description}
                  </p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/50">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-mono font-bold text-secondary-foreground ring-2 ring-background">
                        US
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedReview(review)} className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4 pt-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Title</h4>
                <p>{selectedReview.title}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Description</h4>
                <p>{selectedReview.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Current Status</h4>
                <div className="mt-1">{getStatusBadge(selectedReview.status)}</div>
              </div>

              {selectedReview.cycles && selectedReview.cycles.length > 0 && selectedReview.cycles[0].feedback && (
                <div className="bg-muted/50 p-4 rounded-md border border-border mt-4">
                  <h4 className="font-bold text-sm mb-1">Latest Feedback</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedReview.cycles[0].feedback}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(selectedReview.cycles[0].reviewedAt).toLocaleString()}
                  </p>
                </div>
              )}
              
              {!isStudentMember && (
                <form onSubmit={submitReviewAction} className="space-y-4 pt-4 border-t border-border mt-4">
                  <h4 className="font-semibold">Admin Actions</h4>
                  <div className="space-y-2">
                    <Label>Set Status</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={adminStatus} 
                      onChange={(e) => setAdminStatus(e.target.value)}
                    >
                      <option value="APPROVED">Approve (Ready to go)</option>
                      <option value="REVISION">Request Revision (Needs fixes)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Feedback / Errors</Label>
                    <Textarea
                      placeholder="Mention errors or feedback..."
                      value={adminFeedback}
                      onChange={(e) => setAdminFeedback(e.target.value)}
                      className="min-h-[100px]"
                      required={adminStatus === "REVISION"}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={reviewActionMutation.isPending}>
                      {reviewActionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit Review
                    </Button>
                  </div>
                </form>
              )}

              {isStudentMember && selectedReview.status === "REVISION" && (
                <div className="space-y-4 pt-4 border-t border-border mt-4">
                  <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm border border-destructive/20">
                    <h4 className="font-bold mb-1">Changes Required</h4>
                    <p>The admin has requested changes for this review. Please update your work and resubmit.</p>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={() => reviewActionMutation.mutate({ status: "RESUBMITTED", feedback: "Student resubmitted the review." })}
                      disabled={reviewActionMutation.isPending}
                    >
                      {reviewActionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Resubmit for Review
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
