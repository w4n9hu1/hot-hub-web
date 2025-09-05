import Link from "next/link";
import { getDataMetrics, getRecentTopics } from "@/lib/db";
import { WbHotTopic } from "@/lib/type";
import ClientTime from "@/components/client-time";

export const revalidate = 60 * 60;

export default async function Page() {

    const hotTopics = await getRecentTopics({ days: 0 });
    const monthTopics = await getRecentTopics({ days: 30 });
    const yearTopics = await getRecentTopics({ days: 365 });
    const metrics = await getDataMetrics();

    return (
        <div className="flex flex-col space-y-12 py-8">
            <div className="grid gap-8 md:grid-cols-3">
                <TopicCard 
                    title="⚡ 最新话题" 
                    topics={hotTopics} 
                    gradient="from-blue-500/10 to-cyan-500/10"
                    borderColor="border-blue-200/50 dark:border-blue-800/50"
                />
                <TopicCard 
                    title="📅 当月话题" 
                    topics={monthTopics} 
                    gradient="from-green-500/10 to-emerald-500/10"
                    borderColor="border-green-200/50 dark:border-green-800/50"
                />
                <TopicCard 
                    title="🏆 年度话题" 
                    topics={yearTopics} 
                    gradient="from-yellow-500/10 to-orange-500/10"
                    borderColor="border-yellow-200/50 dark:border-yellow-800/50"
                />
            </div>
            <div className="text-sm text-muted-foreground text-center mt-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm">
                    <span>📊 数据量：{metrics.dataCount} 条</span>
                    <span>•</span>
                    <span>📈 <ClientTime datetime={metrics.dateFrom} /> ~ <ClientTime datetime={metrics.dateTo} /></span>
                </div>
            </div>
        </div>
    )
}

type TopicCardProps = {
    title: string;
    topics?: WbHotTopic[];
    gradient?: string;
    borderColor?: string;
}

function TopicCard({ title, topics, gradient = "from-gray-500/10 to-gray-600/10", borderColor = "border-border" }: TopicCardProps) {
    return (
        <div className={`group relative overflow-hidden rounded-xl ${borderColor} border bg-gradient-to-br ${gradient} backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <h2 className="font-bold text-lg mb-4 text-foreground relative z-10">{title}</h2>
            <div className="flex flex-col space-y-1 relative z-10">
                {
                    topics?.map((topic, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-background/50 transition-colors duration-200">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center text-xs font-medium text-muted-foreground">
                                {index + 1}
                            </span>
                            <Link 
                                prefetch={false} 
                                href={`/topic/${topic.title}`} 
                                className="flex-1 text-sm text-foreground hover:text-primary transition-colors duration-200 hover:underline underline-offset-4 leading-relaxed"
                            >
                                {topic.title}
                            </Link>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

