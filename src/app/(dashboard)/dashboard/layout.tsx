import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { DashboardProviders } from "@/components/providers/dashboard-providers";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProviders>
      <div className="app-shell flex">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col bg-background">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </DashboardProviders>
  );
}
