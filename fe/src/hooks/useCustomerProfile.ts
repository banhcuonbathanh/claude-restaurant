import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSettingsStore } from '@/store/settings'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

export interface CustomerProfile {
  id: string
  name: string
  phone: string
  address: string
  email?: string
  isMember: boolean
  memberSince?: string
  avatarUrl?: string
}

export interface UpdateProfileForm {
  name: string
  phone: string
  address: string
  email?: string
}

const PROFILE_KEY = ['customer', 'profile'] as const

export function useCustomerProfile() {
  return useQuery<CustomerProfile>({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const res = await api.get<CustomerProfile>('/customer/profile')
      return res.data
    },
    staleTime: 5 * 60 * 1000,
    retry: (failCount, err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401 || status === 404) return false
      return failCount < 2
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setCustomerName = useSettingsStore((s) => s.setCustomerName)

  return useMutation({
    mutationFn: (data: UpdateProfileForm) =>
      api.put<CustomerProfile>('/customer/profile', data).then((r) => r.data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY })
      setCustomerName(result.name)
      toast.success('Đã lưu thông tin!')
    },
    onError: () => {
      toast.error('Không thể lưu — kiểm tra kết nối')
    },
  })
}
