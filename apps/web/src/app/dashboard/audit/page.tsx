"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchApi } from "@/lib/api-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuditLogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => fetchApi<{ data: any[] }>("/audit"),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">View system activity and history.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading logs...</TableCell>
                </TableRow>
              ) : (
                data?.data.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-xs">{log.entityType}</span>
                      <br/>
                      <span className="text-[10px] text-muted-foreground">{log.entityId}</span>
                    </TableCell>
                    <TableCell>
                      {log.user ? log.user.name : "System"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.ipAddress || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {data?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">No audit logs found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
