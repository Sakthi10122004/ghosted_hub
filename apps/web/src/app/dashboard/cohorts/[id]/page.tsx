"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchApi } from "@/lib/api-client"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CohortDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data: cohort, isLoading } = useQuery({
    queryKey: ["cohorts", id],
    queryFn: () => fetchApi<any>(`/cohorts/${id}`),
  })

  if (isLoading) return <div className="p-8 text-center">Loading cohort details...</div>
  if (!cohort) return <div className="p-8 text-center">Cohort not found.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/cohorts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{cohort.name}</h1>
          <p className="text-muted-foreground">{cohort.description}</p>
        </div>
        <Badge variant={cohort.status === "ACTIVE" ? "default" : "secondary"} className="text-sm px-4 py-1">
          {cohort.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Projects</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{cohort._count?.projects || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Teams</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{cohort._count?.teams || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Applications</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{cohort._count?.applications || 0}</div></CardContent>
        </Card>
      </div>
      
      {/* Additional tabs or sections would go here */}
    </div>
  )
}
