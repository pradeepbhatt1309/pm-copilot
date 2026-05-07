import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";

export interface Stakeholder {
  id: string;
  name: string;
  organisation: string;
  role: string;
  projects: string[];
  currentConcerns: string[];
  communicationStyle: string;
  openActions: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function useStakeholders() {
  return useQuery({
    queryKey: ["stakeholders"],
    queryFn: () => apiRequest<Stakeholder[]>("GET", "/api/stakeholders"),
  });
}

export function useCreateStakeholder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Stakeholder>) => apiRequest<Stakeholder>("POST", "/api/stakeholders", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stakeholders"] }),
  });
}

export function useUpdateStakeholder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Stakeholder> & { id: string }) =>
      apiRequest<Stakeholder>("PUT", `/api/stakeholders/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stakeholders"] }),
  });
}

export function useDeleteStakeholder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest<{ success: boolean }>("DELETE", `/api/stakeholders/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stakeholders"] }),
  });
}
