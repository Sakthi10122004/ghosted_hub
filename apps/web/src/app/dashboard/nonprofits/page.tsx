"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchApi } from "@/lib/api-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, PlusCircle } from "lucide-react"
import { CreateNonprofitDialog } from "./_components/create-nonprofit-dialog"

export default function NonprofitsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["nonprofits"],
    queryFn: () => fetchApi<{ data: any[] }>("/nonprofits"),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nonprofits</h1>
          <p className="text-muted-foreground">Manage organization profiles and applications.</p>
        </div>
        <CreateNonprofitDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Website</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">Loading nonprofits...</TableCell>
                </TableRow>
              ) : (
                data?.data.map((np) => (
                  <TableRow key={np.id}>
                    <TableCell className="font-medium flex items-center space-x-2">
                      <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span>{np.name}</span>
                    </TableCell>
                    <TableCell>{np.city}, {np.state}</TableCell>
                    <TableCell>
                      {np.websiteUrl ? (
                        <a href={np.websiteUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          {np.websiteUrl.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {data?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">No nonprofits found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
