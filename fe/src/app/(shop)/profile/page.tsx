'use client'
import { useRouter } from 'next/navigation'
import { CustomerTopNav } from '@/components/shared/CustomerTopNav'
import { ProfileAvatarHeader } from './components/ProfileAvatarHeader'
import { PersonalInfoForm } from './components/PersonalInfoForm'
import { QuickNavGrid } from './components/QuickNavGrid'
import { SaveCTABar } from './components/SaveCTABar'
import { ProfilePageSkeleton } from './components/ProfilePageSkeleton'
import { useCustomerProfile, useUpdateProfile } from '@/hooks/useCustomerProfile'
import type { UpdateProfileForm } from '@/hooks/useCustomerProfile'

const FORM_ID = 'profile-form'

export default function ProfilePage() {
  const router = useRouter()
  const { data: profile, isLoading, isError, error } = useCustomerProfile()
  const { mutate: updateProfile, isPending } = useUpdateProfile()

  const is404 = (error as { response?: { status?: number } })?.response?.status === 404

  function handleSubmit(data: UpdateProfileForm) {
    updateProfile(data)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Zone A */}
      <CustomerTopNav
        title="Thông Tin Khách Hàng"
        onBack={() => router.back()}
      />

      {/* Scrollable content */}
      <main className="flex-1 pb-[56px] overflow-y-auto max-w-[420px] w-full mx-auto">
        {isLoading ? (
          <ProfilePageSkeleton />
        ) : (
          <>
            {/* Zone B */}
            <ProfileAvatarHeader
              name={profile?.name ?? ''}
              isMember={profile?.isMember ?? false}
              avatarUrl={profile?.avatarUrl}
            />

            {/* Zone C */}
            <PersonalInfoForm
              formId={FORM_ID}
              defaultValues={
                profile
                  ? {
                      name: profile.name,
                      phone: profile.phone,
                      address: profile.address,
                      email: profile.email ?? '',
                    }
                  : undefined
              }
              onSubmit={handleSubmit}
              isLoading={isPending}
            />

            {/* Zone D */}
            <div className="mt-4">
              <QuickNavGrid />
            </div>

            {/* Zone E */}
            <SaveCTABar
              formId={FORM_ID}
              isLoading={isPending}
              disabled={isError && !is404}
              isNewProfile={is404}
            />
          </>
        )}
      </main>
    </div>
  )
}
