import * as React from "react"

export interface ActivityFeedItem {
  id: string
  title: string
  description: string
  timestamp: string
}

interface ActivityFeedProps {
  title?: string
  items: ActivityFeedItem[]
}

export function ActivityFeed({ title = "Recent Activity", items }: ActivityFeedProps) {
  return (
    <div className="bg-card border border-border rounded-[14px] p-[24px_32px] relative">
      <div className="font-serif text-[19px] font-semibold mb-[20px]">
        {title}
      </div>
      
      <div className="relative">
        <svg width="2" height="100%" className="absolute left-[3px] top-[8px]">
          <line className="animate-dash" style={{ strokeDasharray: 200, strokeDashoffset: 200, animationDelay: '.3s' }} x1="1" y1="0" x2="1" y2="100%" stroke="var(--border)" strokeWidth="2"></line>
        </svg>
        
        <div className="space-y-[16px]">
          {items.map((item, i) => (
            <div key={item.id} className="flex gap-[12px] opacity-0 animate-fade-up" style={{ animationDelay: `${i * 100 + 200}ms` }}>
              <span className="w-[8px] h-[8px] rounded-full bg-primary mt-[6px] shrink-0 opacity-0 animate-pop-in relative z-10" style={{ animationDelay: `${i * 100 + 300}ms` }}></span>
              <div>
                <div className="font-mono text-[10.5px] text-muted-foreground mb-[2px]">{item.timestamp}</div>
                <div className="text-[13.5px] text-foreground leading-snug">
                  <span className="font-semibold text-secondary-foreground">{item.title}</span> — {item.description}
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-[13px] text-muted-foreground py-4">No recent activity.</div>
          )}
        </div>
      </div>
    </div>
  )
}
