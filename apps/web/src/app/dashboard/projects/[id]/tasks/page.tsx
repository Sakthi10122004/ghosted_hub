"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ProjectTasksPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => fetchApi<{ data: any[] }>(`/projects/${projectId}/tasks`),
  });

  const tasks = Array.isArray(data?.data) ? data.data : [];

  const addMutation = useMutation({
    mutationFn: (title: string) =>
      fetchApi(`/projects/${projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify({ title, status: "BACKLOG" }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      setIsAddOpen(false);
      setNewTaskTitle("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      fetchApi(`/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addMutation.mutate(newTaskTitle);
  };

  const cycleStatus = (task: any) => {
    const statuses = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"];
    const currentIndex = statuses.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    updateMutation.mutate({ taskId: task.id, status: statuses[nextIndex] || "BACKLOG" });
  };

  const columns = [
    { id: "BACKLOG", title: "Backlog" },
    { id: "TODO", title: "Todo" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "IN_REVIEW", title: "Review" },
    { id: "COMPLETED", title: "Done" },
  ];

  function getInitials(name: string | undefined | null) {
    if (!name) return "?";
    try {
      return String(name).split(" ").map((n) => n?.[0] || "").join("").toUpperCase().slice(0, 2) || "?";
    } catch (e) {
      return "?";
    }
  }

  if (isLoading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Kanban Board</h2>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTask} className="space-y-4 pt-4">
              <Input
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={!newTaskTitle.trim() || addMutation.isPending}>
                  {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Task
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          
          return (
            <div key={col.id} className="w-80 flex-shrink-0 bg-muted/40 rounded-lg p-4 flex flex-col max-h-[70vh]">
              <h3 className="font-semibold mb-4 flex items-center justify-between text-sm uppercase tracking-wider text-muted-foreground">
                {col.title}
                <Badge variant="secondary">{colTasks.length}</Badge>
              </h3>
              <div className="space-y-3 overflow-y-auto flex-1">
                {colTasks.map((task) => (
                  <Card key={task.id} onClick={() => cycleStatus(task)} className="cursor-pointer hover:border-primary/50 transition-colors">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium leading-tight">{task.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {task.priority || "MEDIUM"}
                        </Badge>
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {task.assignee ? getInitials(task.assignee.name) : "U"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {colTasks.length === 0 && (
                  <div className="p-4 text-center border-2 border-dashed rounded-md border-muted text-muted-foreground text-xs uppercase tracking-widest">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}
