"use client"

import { useQuery } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ApplicationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["applications"],
    // API endpoint for applications needs to be implemented in backend, using empty array for now
    queryFn: async () => ({ data: [] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">Review incoming student and nonprofit applications.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cohort</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading applications...</TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">No applications pending review.</TableCell>
                </TableRow>
              ) : (
                data?.data.map((app: any) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.applicantName}</TableCell>
                    <TableCell>{app.type}</TableCell>
                    <TableCell>{app.cohort}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{app.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Review</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
