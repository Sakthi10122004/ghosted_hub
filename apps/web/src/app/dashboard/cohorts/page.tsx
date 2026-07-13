"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchApi } from "@/lib/api-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import Link from "next/link"
import { CreateCohortDialog } from "./_components/create-cohort-dialog"
import { useUserRole } from "@/hooks/use-user-role"

export default function CohortsPage() {
  const { isAdmin } = useUserRole()
  const { data, isLoading } = useQuery({
    queryKey: ["cohorts"],
    queryFn: () => fetchApi<{ data: any[] }>("/cohorts"),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold uppercase tracking-widest text-foreground">Cohorts</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">Index // Active & Past</p>
        </div>
        {isAdmin && <CreateCohortDialog />}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="w-1/3 text-[10px] font-mono font-bold uppercase tracking-widest border-r border-border/50">Name</TableHead>
                <TableHead className="text-[10px] font-mono font-bold uppercase tracking-widest border-r border-border/50">Status</TableHead>
                <TableHead className="text-[10px] font-mono font-bold uppercase tracking-widest border-r border-border/50">Dates</TableHead>
                <TableHead className="text-right text-[10px] font-mono font-bold uppercase tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">Loading cohorts...</TableCell>
                </TableRow>
              ) : (
                data?.data.map((cohort) => (
                  <TableRow key={cohort.id} className="group cursor-pointer">
                    <TableCell className="font-semibold text-foreground group-hover:text-primary transition-colors border-r border-border/50">
                      <Link href={`/dashboard/cohorts/${cohort.id}`} className="absolute inset-0 z-10" />
                      {cohort.name}
                    </TableCell>
                    <TableCell className="border-r border-border/50">
                      <Badge variant="outline" className={`rounded-none border-border ${cohort.status === "ACTIVE" ? "bg-primary text-primary-foreground border-transparent" : "bg-transparent text-muted-foreground"}`}>
                        {cohort.status === "ACTIVE" ? "ACTIVE" : cohort.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground border-r border-border/50">
                      {new Date(cohort.sprintStartDate).toLocaleDateString()} - {new Date(cohort.sprintEndDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right relative z-20">
                      <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                        <Link href={`/dashboard/cohorts/${cohort.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {data?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">No cohorts found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
