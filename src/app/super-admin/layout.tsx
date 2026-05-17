import SuperAdminSidebar from '@/components/SuperAdminSidebar'

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <SuperAdminSidebar/>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
