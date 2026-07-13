"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Loader2 } from "lucide-react";

export function ProjectChat({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["project-messages", projectId],
    queryFn: () => fetchApi<{ data: any[] }>(`/projects/${projectId}/messages?limit=100`),
    refetchInterval: 5000, // Poll every 5 seconds for real-time feel
  });

  const messages = Array.isArray(data?.data) ? data.data : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const mutation = useMutation({
    mutationFn: (messageData: { content: string }) =>
      fetchApi(`/projects/${projectId}/messages`, {
        method: "POST",
        body: JSON.stringify(messageData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-messages", projectId] });
      setContent("");
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    mutation.mutate({ content: content.trim() });
  };

  function getInitials(name: string | undefined | null) {
    if (!name) return "?";
    try {
      return String(name).split(" ").map((n) => n?.[0] || "").join("").toUpperCase().slice(0, 2) || "?";
    } catch (e) {
      return "?";
    }
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b px-6 py-4 bg-muted/20">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Project Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => {
            try {
              if (!msg) return null;
              return (
                <div key={msg.id || index} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full flex-shrink-0 bg-primary/10 flex items-center justify-center font-bold text-sm text-primary overflow-hidden">
                    {msg?.author?.avatarUrl ? (
                      <img src={msg.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(msg?.author?.name)
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{msg?.author?.name || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">
                        {mounted && msg?.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                    <div className="text-sm bg-muted/40 text-foreground p-3 rounded-2xl rounded-tl-none inline-block border border-border/50">
                      {msg?.content || ""}
                    </div>
                  </div>
                </div>
              );
            } catch (err) {
              console.error("Error rendering message:", err, msg);
              return null;
            }
          })
        )}
      </CardContent>

      <div className="p-4 border-t bg-muted/10">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message to your team..."
            className="flex-1 rounded-full h-11 bg-background border-border px-5 focus-visible:ring-primary"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={mutation.isPending || !content.trim()}
            className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 shadow-md"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </Card>
  );
}
