import Image from "next/image";
export function Logo({ light=false }:{light?:boolean}){return <a href="/" className="flex items-center gap-2"><Image src="/logo/logo-placeholder.svg" alt="Nestly" width={40} height={40} className="rounded-full" priority/><span className={`text-xl font-black tracking-tight ${light?"text-white":"text-nestly-ink"}`}>Nestly</span></a>}
