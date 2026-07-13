"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchApi } from "@/lib/api-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import { CreateNonprofitDialog } from "./_components/create-nonprofit-dialog"
import { EditNonprofitDialog } from "./_components/edit-nonprofit-dialog"
import { useUserRole } from "@/hooks/use-user-role"

export default function NonprofitsPage() {
  const { isAdmin } = useUserRole()
  const { data, isLoading } = useQuery({
    queryKey: ["nonprofits"],
    queryFn: () => fetchApi<{ data: any[] }>("/nonprofits"),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold uppercase tracking-widest text-foreground">Nonprofits</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">Index // Organization Profiles</p>
        </div>
        {isAdmin && <CreateNonprofitDialog />}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="w-1/3 text-[10px] font-mono font-bold uppercase tracking-widest border-r border-border/50">Organization Name</TableHead>
                <TableHead className="text-[10px] font-mono font-bold uppercase tracking-widest border-r border-border/50">Location</TableHead>
                <TableHead className="text-[10px] font-mono font-bold uppercase tracking-widest border-r border-border/50">Website</TableHead>
                <TableHead className="text-right text-[10px] font-mono font-bold uppercase tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">Loading nonprofits...</TableCell>
                </TableRow>
              ) : (
                data?.data.map((np) => (
                  <TableRow key={np.id} className="group">
                    <TableCell className="font-semibold text-foreground flex items-center gap-3 border-r border-border/50">
                      <div className="h-8 w-8 border border-border flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-mono uppercase tracking-widest text-xs">{np.name}</span>
                    </TableCell>
                    <TableCell className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground border-r border-border/50">{np.city}, {np.state}</TableCell>
                    <TableCell className="border-r border-border/50">
                      {np.websiteUrl ? (
                        <a href={np.websiteUrl} target="_blank" rel="noreferrer" className="text-primary hover:bg-primary/10 transition-colors font-mono text-[11px] uppercase tracking-widest px-1 py-0.5 border border-transparent hover:border-primary">
                          {np.websiteUrl.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-muted-foreground/50">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isAdmin && <EditNonprofitDialog nonprofit={np} />}
                        <Button variant="ghost" size="sm" className="text-primary">View</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {data?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">No nonprofits found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
