"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ProjectDeliverablesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Deliverables</h2>
        <Button>Submit Deliverable</Button>
      </div>

      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No deliverables submitted yet.
        </CardContent>
      </Card>
    </div>
  )
}
