"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

export function useUserRole() {
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const { data: dbUser, isPending: dbPending } = useQuery({
    queryKey: ["user", session?.user?.id],
    queryFn: () => fetchApi<any>(`/users/${session?.user?.id}`),
    enabled: !!session?.user?.id,
  });

  const isPending = sessionPending || (!!session?.user?.id && dbPending);
  const primaryRole = dbUser?.roles?.[0]?.role?.toUpperCase() || "STUDENT";
  const isStudent = primaryRole === "STUDENT" || primaryRole === "NONPROFIT_REP";
  const isSuperAdmin = primaryRole === "SUPER_ADMIN";
  const isAdmin = isSuperAdmin || primaryRole === "ORGANIZER";

  return {
    session,
    dbUser,
    isPending,
    primaryRole,
    isStudent,
    isAdmin,
    isSuperAdmin,
  };
}
