import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1100px] flex-col overflow-hidden border-line bg-surface md:my-6 md:flex-row md:rounded-card md:border md:shadow-card">
      <Sidebar />
      <div className="flex-1 bg-gradient-to-b from-surface to-[#f7fafe] p-4 md:p-6">
        <Topbar />
        {children}
      </div>
    </div>
  );
}
