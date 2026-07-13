"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchApi } from "@/lib/api-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import Link from "next/link"
import { CreateCohortDialog } from "./_components/create-cohort-dialog"

export default function CohortsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["cohorts"],
    queryFn: () => fetchApi<{ data: any[] }>("/cohorts"),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cohorts</h1>
          <p className="text-muted-foreground">Manage active and past program cohorts.</p>
        </div>
        <CreateCohortDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Cohorts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">Loading cohorts...</TableCell>
                </TableRow>
              ) : (
                data?.data.map((cohort) => (
                  <TableRow key={cohort.id}>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/cohorts/${cohort.id}`} className="hover:underline">
                        {cohort.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cohort.status === "ACTIVE" ? "default" : "secondary"}>
                        {cohort.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(cohort.sprintStartDate).toLocaleDateString()} - {new Date(cohort.sprintEndDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/cohorts/${cohort.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {data?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">No cohorts found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
