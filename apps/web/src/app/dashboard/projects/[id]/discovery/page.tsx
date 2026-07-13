"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function ProjectDiscoveryPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ requirements: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["discovery", projectId],
    queryFn: () => fetchApi<any>(`/projects/${projectId}/discovery`),
  });

  const discovery = data; // Assuming it returns the discovery object directly

  const mutation = useMutation({
    mutationFn: (dataToSave: any) =>
      fetchApi(`/projects/${projectId}/discovery`, {
        method: "PATCH",
        body: JSON.stringify(dataToSave),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discovery", projectId] });
      setIsEditing(false);
    },
  });

  const handleEdit = () => {
    setFormData({ requirements: discovery?.requirements?.text || "" });
    setIsEditing(true);
  };

  const handleSave = () => {
    mutation.mutate({ requirements: { text: formData.requirements } });
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Discovery & Requirements</h2>
        {!isEditing ? (
          <Button onClick={handleEdit}>Edit Requirements</Button>
        ) : (
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Brief</CardTitle>
          <CardDescription>Requirements gathered from the nonprofit application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea 
                value={formData.requirements}
                onChange={(e) => setFormData({ requirements: e.target.value })}
                placeholder="Enter project requirements, target audience, key features..."
                className="min-h-[200px]"
              />
            </div>
          ) : (
            <div className="space-y-2 whitespace-pre-wrap">
              {discovery?.requirements?.text ? (
                <p>{discovery.requirements.text}</p>
              ) : (
                <p className="text-muted-foreground italic">No requirements have been documented yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Brand Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground italic mb-4">No branding files uploaded yet.</p>
            <Button variant="outline" size="sm" disabled>Upload Brand Assets</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sitemap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground italic mb-4">Sitemap has not been drafted.</p>
            <Button variant="outline" size="sm" disabled>Draft Sitemap</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
