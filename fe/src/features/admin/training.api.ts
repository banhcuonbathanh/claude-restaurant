import { api } from '@/lib/api-client'
import type {
  JobGuide,
  StaffRole,
  GuideProgressPage,
  StaffProgressDetail,
  CreateGuideInput,
} from '@/types/training'

const BASE = '/admin/training'

export const listGuides = (role?: StaffRole | 'all'): Promise<JobGuide[]> => {
  const params = role && role !== 'all' ? `?role=${role}` : ''
  return api.get(`${BASE}/guides${params}`).then(r => r.data?.data ?? [])
}

export const createGuide = (body: CreateGuideInput): Promise<JobGuide> =>
  api.post(`${BASE}/guides`, body).then(r => r.data.data)

export const updateGuide = (id: string, body: CreateGuideInput): Promise<JobGuide> =>
  api.patch(`${BASE}/guides/${id}`, body).then(r => r.data.data)

export const deleteGuide = (id: string): Promise<void> =>
  api.delete(`${BASE}/guides/${id}`)

export const listGuideProgress = (
  guideId: string,
  page = 1,
  pageSize = 10,
): Promise<GuideProgressPage> =>
  api
    .get(`${BASE}/guides/${guideId}/progress?page=${page}&pageSize=${pageSize}`)
    .then(r => r.data)

export const getStaffProgressDetail = (
  staffId: string,
  guideId: string,
): Promise<StaffProgressDetail> =>
  api.get(`${BASE}/staff/${staffId}/progress/${guideId}`).then(r => r.data.data)

export const updateManagerNotes = (
  staffId: string,
  guideId: string,
  managerNotes: string,
): Promise<void> =>
  api.patch(`${BASE}/staff/${staffId}/progress/${guideId}`, { managerNotes })
