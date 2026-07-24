"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchApi } from "@/lib/api-client"
import { useParams, useRouter } from "next/navigation"
import { Building2, Globe, MapPin, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function NonprofitProfilePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data, isLoading } = useQuery({
    queryKey: ["nonprofits", id],
    queryFn: () => fetchApi<any>(`/nonprofits/${id}`),
  })

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin opacity-50"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </div>
    )
  }

  if (!data) {
    return <div className="py-12 text-center text-muted-foreground">Nonprofit not found.</div>
  }

  const nonprofit = data

  return (
    <div className="max-w-[1000px] mx-auto pb-16">
      {/* Back button */}
      <button 
        onClick={() => router.back()} 
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Nonprofits
      </button>

      {/* Header Profile Card */}
      <div className="bg-card border border-border rounded-[14px] p-[32px] mb-[24px] opacity-0 animate-fade-up">
        <div className="flex items-start gap-6">
          <Avatar className="w-24 h-24 rounded-[16px] border border-border shadow-sm">
            <AvatarImage src={nonprofit.logoUrl} />
            <AvatarFallback className="rounded-[16px] bg-muted text-2xl font-serif">
              {nonprofit.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-serif text-[28px] font-semibold text-foreground mb-2">
              {nonprofit.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              {nonprofit.city && nonprofit.state && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {nonprofit.city}, {nonprofit.state}
                </div>
              )}
              {nonprofit.websiteUrl && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <a href={nonprofit.websiteUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {nonprofit.websiteUrl.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
            {nonprofit.description ? (
              <p className="text-[14.5px] leading-relaxed text-foreground/80 max-w-3xl">
                {nonprofit.description}
              </p>
            ) : (
              <p className="text-[14.5px] italic text-muted-foreground/50">
                No description provided.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-[24px]">
        {/* Projects Section */}
        <div className="bg-card border border-border rounded-[14px] p-[24px] opacity-0 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <h2 className="font-serif text-[18px] font-semibold mb-6 pb-4 border-b border-border">Associated Projects</h2>
          
          {nonprofit.projects && nonprofit.projects.length > 0 ? (
            <div className="space-y-3">
              {nonprofit.projects.map((project: any) => (
                <Link 
                  href={`/dashboard/projects/${project.id}`} 
                  key={project.id}
                  className="block p-4 rounded-[10px] border border-border bg-muted/20 hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-sans font-medium text-[14.5px] text-foreground group-hover:text-primary transition-colors">
                      {project.name}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-background px-2 py-1 rounded-md border border-border/50">
                      {project.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center">
              <Building2 className="w-8 h-8 opacity-20 mb-3" />
              No active projects.
            </div>
          )}
        </div>

        {/* Contacts Section */}
        <div className="bg-card border border-border rounded-[14px] p-[24px] opacity-0 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <h2 className="font-serif text-[18px] font-semibold mb-6 pb-4 border-b border-border">Key Contacts</h2>
          
          {nonprofit.contacts && nonprofit.contacts.length > 0 ? (
            <div className="space-y-4">
              {nonprofit.contacts.map((contact: any) => (
                <div key={contact.id} className="flex items-center gap-3 p-3 rounded-[10px] hover:bg-muted/30 transition-colors">
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {contact.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-[14px] text-foreground">{contact.user.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      <a href={`mailto:${contact.user.email}`} className="hover:text-primary hover:underline">
                        {contact.user.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center">
              <Mail className="w-8 h-8 opacity-20 mb-3" />
              No contacts assigned.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
