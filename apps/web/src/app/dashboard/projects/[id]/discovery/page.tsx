"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ProjectDiscoveryPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Discovery & Requirements</h2>
        <Button>Edit Requirements</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Brief</CardTitle>
          <CardDescription>Initial requirements gathered from the nonprofit application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Target Audience</h3>
            <p>Our primary audience includes local community members looking for volunteer opportunities and potential donors who want to support our mission.</p>
          </div>
          <div className="space-y-2 border-t pt-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Key Features Required</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Donation portal integration</li>
              <li>Events calendar with RSVP capability</li>
              <li>Volunteer signup forms</li>
              <li>Blog for community updates</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Brand Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground italic mb-4">No branding files uploaded yet.</p>
            <Button variant="outline" size="sm">Upload Brand Assets</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sitemap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground italic mb-4">Sitemap has not been drafted.</p>
            <Button variant="outline" size="sm">Draft Sitemap</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
