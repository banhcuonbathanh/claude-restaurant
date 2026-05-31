'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listGuides,
  createGuide,
  updateGuide,
  deleteGuide,
  listGuideProgress,
  getStaffProgressDetail,
  updateManagerNotes,
} from '@/features/admin/training.api'
import type { StaffRole, CreateGuideInput } from '@/types/training'

export const useJobGuides = (role: StaffRole | 'all' = 'all') =>
  useQuery({
    queryKey: ['training', 'guides', role],
    queryFn: () => listGuides(role),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

export const useGuideProgress = (guideId: string, page: number, pageSize = 10) =>
  useQuery({
    queryKey: ['training', 'progress', guideId, page],
    queryFn: () => listGuideProgress(guideId, page, pageSize),
    staleTime: 2 * 60 * 1000,
    enabled: !!guideId,
  })

export const useStaffProgressDetail = (staffId: string, guideId: string, open: boolean) =>
  useQuery({
    queryKey: ['training', 'staffProgress', staffId, guideId],
    queryFn: () => getStaffProgressDetail(staffId, guideId),
    enabled: open && !!staffId && !!guideId,
  })

export const useCreateGuide = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateGuideInput) => createGuide(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['training', 'guides'] }),
  })
}

export const useUpdateGuide = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CreateGuideInput }) => updateGuide(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['training', 'guides'] }),
  })
}

export const useDeleteGuide = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteGuide(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['training', 'guides'] }),
  })
}

export const useUpdateManagerNotes = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ staffId, guideId, notes }: { staffId: string; guideId: string; notes: string }) =>
      updateManagerNotes(staffId, guideId, notes),
    onSuccess: (_data, { staffId, guideId }) =>
      qc.invalidateQueries({ queryKey: ['training', 'staffProgress', staffId, guideId] }),
  })
}
