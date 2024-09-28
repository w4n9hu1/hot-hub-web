import Link from "next/link";

export default function Footer() {
    return (
        <footer className="p-8 text-sm text-center text-muted-foreground">
            <p className="flex gap-4 justify-end">© {new Date().getFullYear()}
                <Link href={process.env.GITHUB_URL || "/"} className="hover:underline underline-offset-4"> Hot Topics Hub</Link>
            </p>
        </footer>
    );
}