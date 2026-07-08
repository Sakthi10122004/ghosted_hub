import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start space-x-4 border-l-2 border-primary/20 pl-4 py-1">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {item.timestamp}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">No recent activity.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
