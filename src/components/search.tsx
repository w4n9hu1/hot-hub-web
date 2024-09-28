'use client'

import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation'
import { useState } from 'react';

export default function Search() {
    const router = useRouter()
    const [query, setQuery] = useState<string>('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            router.push(`/search?query=${trimmedQuery}`);
            setQuery('');
        }
    }

    return (
        <div className="w-full md:max-w-md">
            <form className="flex items-center" onSubmit={handleSubmit}>
                <div className="relative flex-1">
                    <Input
                        id='search'
                        name='search'
                        required
                        minLength={2}
                        onChange={(e) => setQuery(e.target.value)}
                        value={query}
                        type="search"
                        placeholder="搜索话题..."
                        className="py-2 pl-10 pr-4 border rounded-md border-muted"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                </div>
            </form>
        </div>
    )
}