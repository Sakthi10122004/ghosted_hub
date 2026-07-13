"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function CreateNonprofitDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mission: "",
    vision: "",
    websiteUrl: "",
    city: "",
    country: "",
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newNonprofit: any) => {
      return fetchApi("/nonprofits", {
        method: "POST",
        body: JSON.stringify(newNonprofit),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nonprofits"] });
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        mission: "",
        vision: "",
        websiteUrl: "",
        city: "",
        country: "",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-foreground hover:bg-foreground/90 text-background px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-foreground/20 transition-all hover:scale-[1.02]">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Nonprofit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-3xl p-8 border-border/50 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold text-foreground">Add Nonprofit</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Onboard a new non-profit organization into the program.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3 col-span-2">
              <Label htmlFor="name" className="text-sm font-bold text-foreground">Organization Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Wildlife Trust"
                value={formData.name}
                onChange={handleChange}
                className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
                required
              />
            </div>
            
            <div className="space-y-3 col-span-2">
              <Label htmlFor="description" className="text-sm font-bold text-foreground">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the organization"
                value={formData.description}
                onChange={handleChange}
                className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary px-4 py-3 resize-none h-24"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="mission" className="text-sm font-bold text-foreground">Mission</Label>
              <Input
                id="mission"
                placeholder="Organization mission"
                value={formData.mission}
                onChange={handleChange}
                className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="vision" className="text-sm font-bold text-foreground">Vision</Label>
              <Input
                id="vision"
                placeholder="Organization vision"
                value={formData.vision}
                onChange={handleChange}
                className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
              />
            </div>

            <div className="space-y-3 col-span-2">
              <Label htmlFor="websiteUrl" className="text-sm font-bold text-foreground">Website URL</Label>
              <Input
                id="websiteUrl"
                placeholder="https://example.org"
                value={formData.websiteUrl}
                onChange={handleChange}
                className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
                type="url"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="city" className="text-sm font-bold text-foreground">City</Label>
              <Input
                id="city"
                placeholder="e.g. San Francisco"
                value={formData.city}
                onChange={handleChange}
                className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="country" className="text-sm font-bold text-foreground">Country</Label>
              <Input
                id="country"
                placeholder="e.g. USA"
                value={formData.country}
                onChange={handleChange}
                className="rounded-xl border-border bg-muted/50 focus-visible:ring-primary h-12 px-4"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="rounded-xl font-bold text-muted-foreground"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Add Nonprofit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
