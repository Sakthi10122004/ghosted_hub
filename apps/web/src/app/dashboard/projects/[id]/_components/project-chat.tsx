"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { useUserRole } from "@/hooks/use-user-role";
import { CheckCheck, Paperclip, Smile, Send, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import { useAlert } from "@/hooks/use-alert";

export function ProjectChat({ projectId }: { projectId: string }) {
  const { session } = useUserRole();
  const currentUserId = session?.user?.id;
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const { theme } = useTheme();
  const [AlertDialogComponent, customAlert] = useAlert();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file) return;
      setContent(prev => prev + (prev ? " " : "") + `[Attached: ${file.name}]`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["project-messages", projectId],
    queryFn: () => fetchApi<{ data: any[] }>(`/projects/${projectId}/messages?limit=100`),
    refetchInterval: 5000, 
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

  // Helper to format date
  const formatTime = (dateStr: string) => {
    if (!mounted || !dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group messages by day (simplified for now: just showing "Today" if any exist)
  // In a real app, we'd check dates.

  return (
    <>
    <AlertDialogComponent />
    <div className="flex flex-col h-[650px] bg-card border border-border rounded-[14px] overflow-hidden shadow-sm">
      
      {/* WhatsApp-style Header */}
      <div className="border-b border-border p-[10px_24px] bg-card flex items-center justify-between shrink-0 z-10 shadow-sm relative">
        <div className="flex items-center gap-[14px]">
          <div className="w-[40px] h-[40px] rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <div className="font-semibold text-[15px] text-foreground">Project Discussion</div>
                <div className="text-[11.5px] text-muted-foreground hover:underline">tap here for group info</div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[24px] p-0 border-border/50 shadow-2xl overflow-hidden">
              <div className="bg-card p-6 pb-4">
                <DialogHeader className="mb-0">
                  <DialogTitle className="font-serif text-[22px] font-medium text-foreground mb-4">
                    Group Info
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center py-4 border-b border-border mb-4">
                  <div className="w-[80px] h-[80px] rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-4 border border-primary/20 shadow-sm">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <h3 className="font-semibold text-lg">Project Discussion</h3>
                  <p className="text-sm text-muted-foreground mt-1">End-to-End Encrypted Team Chat</p>
                </div>
                
                <div className="space-y-[20px] px-2 pb-4">
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-muted-foreground font-medium">Media, Links, and Docs</span>
                    <span className="text-primary font-semibold cursor-pointer hover:underline text-[13px]">0 &gt;</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-muted-foreground font-medium">Starred Messages</span>
                    <span className="text-primary font-semibold cursor-pointer hover:underline text-[13px]">None &gt;</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-muted-foreground font-medium">Mute Notifications</span>
                    <div className="w-[36px] h-[20px] bg-muted-foreground/30 rounded-full cursor-pointer relative transition-colors shadow-inner">
                      <div className="w-[16px] h-[16px] bg-background rounded-full absolute top-[2px] left-[2px] shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-[20px] text-muted-foreground">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MoreVertical className="w-5 h-5 cursor-pointer hover:text-primary transition-colors outline-none" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuItem onClick={() => customAlert('Info', 'Group Info modal would open here.')}>Group Info</DropdownMenuItem>
              <DropdownMenuItem onClick={() => customAlert('Info', 'Search functionality would open here.')}>Search</DropdownMenuItem>
              <DropdownMenuItem onClick={() => customAlert('Success', 'Notifications muted.')}>Mute Notifications</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => customAlert('Info', 'Clear chat requested.')}>Clear Chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Chat Area */}
      <div 
        className="flex-1 overflow-y-auto p-[24px_32px] space-y-[4px] relative bg-background/50" 
        ref={scrollRef}
      >

        {isLoading ? (
          <div className="flex justify-center py-8">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin opacity-50 text-muted-foreground"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="opacity-20 mb-3 text-muted-foreground"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/></svg>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => {
            try {
              if (!msg) return null;
              
              const isMe = msg?.authorId === currentUserId || msg?.author?.id === currentUserId;
              const timeStr = formatTime(msg?.createdAt);
              
              // WhatsApp bubbles typically have a tiny tail SVG. We use precise rounded corners to simulate it.
              return (
                <div key={msg.id || index} className={`flex w-full mb-[2px] opacity-0 animate-fade-up ${isMe ? 'justify-end' : 'justify-start'}`} style={{ animationDelay: `${index * 30}ms` }}>
                  
                  {!isMe && (
                    <div className="w-[28px] h-[28px] rounded-full shrink-0 bg-secondary text-secondary-foreground flex items-center justify-center font-bold font-mono text-[10px] mr-[8px] self-end mb-[2px] overflow-hidden border border-border">
                      {msg?.author?.avatarUrl ? (
                        <img src={msg.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(msg?.author?.name)
                      )}
                    </div>
                  )}
                  
                  <div className={`relative max-w-[75%] px-[14px] pt-[10px] pb-[6px] shadow-sm text-[14px] leading-[1.4] ${
                    isMe 
                      ? 'bg-primary text-primary-foreground rounded-l-[14px] rounded-tr-[14px] rounded-br-[4px]' 
                      : 'bg-card border border-border text-foreground rounded-r-[14px] rounded-tl-[14px] rounded-bl-[4px]'
                  }`}>
                    
                    {!isMe && (
                      <div className="text-[12.5px] font-semibold text-primary mb-[2px]">
                        {msg?.author?.name || "Unknown"}
                      </div>
                    )}
                    
                    <span className="break-words align-top">{msg?.content || ""}</span>
                    
                    {/* Time & Read Receipt Inline */}
                    <span className={`float-right ml-[14px] mt-[10px] flex items-center gap-[4px] text-[10.5px] relative top-[2px] ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      <span>{timeStr}</span>
                      {isMe && <CheckCheck className="w-[14px] h-[14px] text-primary-foreground/90" />}
                    </span>
                    
                    {/* Clearfix for float */}
                    <div className="clear-both"></div>
                  </div>
                </div>
              );
            } catch (err) {
              console.error("Error rendering message:", err, msg);
              return null;
            }
          })
        )}
      </div>

      {/* Input Bar */}
      <div className="p-[14px_20px] bg-card border-t border-border flex items-end gap-[14px] relative">
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        
        {showEmojis && (
          <div className="absolute bottom-[70px] left-[20px] z-50 shadow-2xl rounded-[8px] animate-fade-up" style={{ animationDuration: '150ms' }}>
            <EmojiPicker 
              onEmojiClick={(emojiObject) => {
                setContent(prev => prev + emojiObject.emoji);
              }}
              theme={theme === 'dark' ? Theme.DARK : theme === 'light' ? Theme.LIGHT : Theme.AUTO}
              width={320}
              height={400}
              lazyLoadEmojis={true}
              skinTonesDisabled
            />
          </div>
        )}

        <div className="flex gap-[16px] items-center text-muted-foreground pb-[10px] px-[4px]">
          <Smile 
            className={`w-[22px] h-[22px] cursor-pointer transition-colors ${showEmojis ? 'text-primary' : 'hover:text-foreground'}`} 
            onClick={() => setShowEmojis(!showEmojis)}
          />
          <Paperclip 
            className="w-[20px] h-[20px] cursor-pointer hover:text-foreground transition-colors" 
            onClick={() => fileInputRef.current?.click()}
          />
        </div>
        
        <form onSubmit={handleSend} className="flex-1 flex gap-[14px]">
          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="w-full bg-background text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-[20px] p-[10px_18px] text-[14px] focus:outline-none resize-none max-h-[120px] shadow-sm leading-relaxed transition-all"
              style={{ minHeight: '44px' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={mutation.isPending || !content.trim()}
            className="w-[44px] h-[44px] rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-0 disabled:w-0 disabled:overflow-hidden transition-all duration-200 shadow-sm hover:bg-primary/90"
          >
            {mutation.isPending ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="animate-spin"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            ) : (
              <Send className="w-[18px] h-[18px] translate-x-[-1px] translate-y-[1px]" />
            )}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
