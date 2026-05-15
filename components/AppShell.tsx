import Link from "next/link";
import {
LayoutDashboard,
MessageCircle,
User,
Search,
BriefcaseBusiness,
ShieldCheck,
Home,
} from "lucide-react";
import { Logo } from "@/components/Logo";

function NavItem({
href,
label,
children,
}: {
href: string;
label: string;
children: React.ReactNode;
}) {
return (
<Link
href={href}
className="group flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-black text-nestly-muted transition hover:bg-nestly-mint hover:text-nestly-ink lg:relative lg:h-12 lg:w-12 lg:px-0 lg:py-0"
>
{children}
<span className="lg:pointer-events-none lg:absolute lg:left-16 lg:top-1/2 lg:hidden lg:-translate-y-1/2 lg:whitespace-nowrap lg:rounded-full lg:bg-nestly-ink lg:px-3 lg:py-1 lg:text-xs lg:text-white lg:shadow-premium lg:group-hover:block">
{label}
</span>
</Link>
);
}

export function AppShell({
children,
role,
}: {
children: React.ReactNode;
role: "customer" | "provider" | "admin";
}) {
const dash =
role === "provider" ? "/provider" : role === "admin" ? "/admin" : "/customer";

const searchHref = role === "provider" ? "/provider/search" : "/customer/search";
const searchLabel = role === "provider" ? "Customers" : "Providers";

return (
<main className="min-h-screen bg-nestly-soft text-nestly-ink">
<header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-2xl lg:pl-28">
<div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:pr-8">
<Logo />

<nav className="hidden items-center gap-6 text-sm font-black md:flex">
<Link href={dash}>Dashboard</Link>
{role === "provider" && <Link href="/provider/jobs-feed">Jobs Feed</Link>}
<Link href={searchHref}>Search {searchLabel}</Link>
<Link href="/messages">Messages</Link>
<Link href="/profile">Profile</Link>
</nav>
</div>
</header>

{/* Desktop sidebar */}
<aside className="fixed left-6 top-6 z-40 hidden h-[calc(100vh-48px)] w-20 flex-col items-center justify-around rounded-[2rem] border border-white/70 bg-white/90 p-3 shadow-glass backdrop-blur-2xl lg:flex">
<NavItem href="/" label="Home">
<Home size={20} />
</NavItem>

<NavItem href={dash} label="Dashboard">
<LayoutDashboard size={20} />
</NavItem>

{role === "provider" && (
<NavItem href="/provider/jobs-feed" label="Jobs Feed">
<BriefcaseBusiness size={20} />
</NavItem>
)}

<NavItem href={searchHref} label={`Search ${searchLabel}`}>
<Search size={20} />
</NavItem>

<NavItem href="/messages" label="Messages">
<MessageCircle size={20} />
</NavItem>

<NavItem href="/profile" label="Profile">
<User size={20} />
</NavItem>

{role === "admin" && (
<NavItem href="/admin" label="Admin">
<ShieldCheck size={20} />
</NavItem>
)}
</aside>

<section className="mx-auto max-w-7xl px-5 pb-28 pt-6 lg:pl-32 lg:pr-8">
{children}
</section>

{/* Mobile bottom nav */}
<nav className="fixed bottom-3 left-3 right-3 z-50 grid grid-cols-5 rounded-[1.7rem] border border-white/70 bg-white/95 p-2 shadow-glass backdrop-blur-2xl lg:hidden">
<NavItem href={dash} label="Home">
<LayoutDashboard size={20} />
</NavItem>

<NavItem href={searchHref} label={searchLabel}>
<Search size={20} />
</NavItem>

{role === "provider" ? (
<NavItem href="/provider/jobs-feed" label="Jobs">
<BriefcaseBusiness size={20} />
</NavItem>
) : (
<NavItem href="/contact" label="Request">
<BriefcaseBusiness size={20} />
</NavItem>
)}

<NavItem href="/messages" label="Chat">
<MessageCircle size={20} />
</NavItem>

<NavItem href="/profile" label="Profile">
<User size={20} />
</NavItem>
</nav>
</main>
);
}