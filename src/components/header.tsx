import { TrendingUp } from "lucide-react";
import Link from "next/link";
import Search from "@/components/search";

export default function Header() {
    return (
        <header className="flex flex-col gap-8 px-4 py-8 md:flex-row backdrop-blur-sm bg-background/80 border-b border-border/40">
            <Link href="/" className="flex items-center gap-3 text-xl font-bold leading-none text-foreground hover:text-primary transition-colors">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" /> 
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">🔥 热点话题</span>
                </div>
            </Link>
            <div className="flex justify-end flex-1">
                <Search />
            </div>
        </header>
    )
}