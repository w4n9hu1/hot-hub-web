import { TrendingUp } from "lucide-react";
import Link from "next/link";
import Search from "@/components/search";

export default function Header() {
    return (
        <header className="flex flex-col gap-8 px-4 py-8 md:flex-row">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold leading-none"><TrendingUp /> <span >热点话题</span></Link>
            <div className="flex justify-end flex-1">
                <Search />
            </div>
        </header>
    )
}