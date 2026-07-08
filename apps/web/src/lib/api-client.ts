export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
  
  // TODO: Add auth headers here once Better Auth is wired
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}
