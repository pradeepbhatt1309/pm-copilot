import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Bot, History, Users, FolderKanban, FileText, Settings } from "lucide-react";

const navItems = [
  { href: "/", label: "Copilot", icon: Bot },
  { href: "/history", label: "History", icon: History },
  { href: "/stakeholders", label: "Stakeholders", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-16 md:w-56 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="hidden md:block font-semibold text-sm">PM Copilot</span>
          </div>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <a
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors mb-1",
                  location === href
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:block">{label}</span>
              </a>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <p className="hidden md:block text-xs text-muted-foreground">BFSI Wealth &amp; Asset</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
