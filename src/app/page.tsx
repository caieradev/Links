import { LandingPage } from '@/components/landing/landing-page'
import { MetaViewContent } from '@/components/meta-view-content'

export default function HomePage() {
  return (
    <>
      <MetaViewContent contentName="Landing Page" />
      <LandingPage />
    </>
  )
}
