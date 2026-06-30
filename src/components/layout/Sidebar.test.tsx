import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

describe("Sidebar top-level items", () => {
  it("renders all top-level labels", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/dashboard");
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Pregunta a Tony")).toBeInTheDocument();
    expect(screen.getByText("Radar")).toBeInTheDocument();
    expect(screen.getByText("Mi Cartera")).toBeInTheDocument();
    expect(screen.getByText("Roadmap")).toBeInTheDocument();
    expect(screen.getByText("Comunidad")).toBeInTheDocument();
  });
});

describe("Mi Cartera group", () => {
  it("hides sub-items when group is closed", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/dashboard");
    render(<Sidebar />);
    expect(screen.queryByText("Mis datos")).not.toBeInTheDocument();
    expect(screen.queryByText("Transacciones")).not.toBeInTheDocument();
  });

  it("shows sub-items when on a child route (auto-expand)", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/transacciones");
    render(<Sidebar />);
    expect(screen.getByText("Transacciones")).toBeInTheDocument();
    expect(screen.getByText("Mis datos")).toBeInTheDocument();
    expect(screen.getByText("Metas")).toBeInTheDocument();
  });

  it("toggles open when chevron button is clicked", async () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/dashboard");
    render(<Sidebar />);
    expect(screen.queryByText("Mis datos")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /mi cartera/i }));
    expect(screen.getByText("Mis datos")).toBeInTheDocument();
  });
});

describe("Comunidad group", () => {
  it("shows Educación sub-item when on /educacion", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/educacion");
    render(<Sidebar />);
    expect(screen.getByText("Educación")).toBeInTheDocument();
  });
});
