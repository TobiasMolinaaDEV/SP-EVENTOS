import { AppSidebar } from "./AppSidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <main className="flex-1 lg:ml-0 min-h-screen">
        <div className="p-4 pt-16 lg:pt-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
