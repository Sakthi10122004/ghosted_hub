"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function ProjectTasksPage() {
  const columns = [
    { title: "Backlog", tasks: [{ id: "1", title: "Setup repository", priority: "HIGH" }, { id: "2", title: "Design homepage mockup", priority: "MEDIUM" }] },
    { title: "Todo", tasks: [{ id: "3", title: "Initialize Next.js app", priority: "HIGH" }] },
    { title: "In Progress", tasks: [] },
    { title: "Review", tasks: [] },
    { title: "Done", tasks: [] },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Kanban Board</h2>
        <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Task</Button>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.title} className="w-80 flex-shrink-0 bg-muted/40 rounded-lg p-4 flex flex-col max-h-[70vh]">
            <h3 className="font-semibold mb-4 flex items-center justify-between">
              {col.title}
              <Badge variant="secondary">{col.tasks.length}</Badge>
            </h3>
            <div className="space-y-3 overflow-y-auto flex-1">
              {col.tasks.map((task) => (
                <Card key={task.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {task.priority}
                      </Badge>
                      <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                        U
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {col.tasks.length === 0 && (
                <div className="p-4 text-center border-2 border-dashed rounded-md border-muted text-muted-foreground text-sm">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
