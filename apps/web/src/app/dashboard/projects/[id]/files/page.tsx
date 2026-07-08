"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud } from "lucide-react"

export default function ProjectFilesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Files</h2>
        <Button><UploadCloud className="mr-2 h-4 w-4" /> Upload File</Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 border-dashed border-2 m-6 rounded-lg text-muted-foreground">
          <UploadCloud className="h-10 w-10 mb-4 opacity-50" />
          <p>Drag and drop files here, or click to browse</p>
        </CardContent>
      </Card>
    </div>
  )
}
