"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ProjectReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Reviews</h2>
        <Button>Request Review</Button>
      </div>

      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No reviews requested yet.
        </CardContent>
      </Card>
    </div>
  )
}
