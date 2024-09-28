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
        <div className="flex flex-col space-y-8">
            <div className="grid gap-8 md:grid-cols-3">
                <TopicCard title="最新话题" topics={hotTopics} />
                <TopicCard title="当月话题" topics={monthTopics} />
                <TopicCard title="年度话题" topics={yearTopics} />
            </div>
            <div className="text-sm text-muted-foreground text-center ">
                <p><ClientTime datetime={metrics.dateFrom} /> ~ <ClientTime datetime={metrics.dateTo} /></p>
                <p>数据量：{metrics.dataCount} 条</p>
            </div>
        </div>
    )
}

type TopicCardProps = {
    title: string;
    topics?: WbHotTopic[];
}

function TopicCard({ title, topics }: TopicCardProps) {
    return (
        <div className="border rounded-md border-inherit p-4 hover:shadow">
            <p className="font-bold mb-2 ">{title}</p>
            <div className="flex flex-col">
                {
                    topics?.map((topic, index) => (
                        <div key={index} className="flex p-2">
                            <p className="mr-2">{index + 1}.</p>
                            <Link prefetch={false} href={`/topic/${topic.title}`} className="hover:underline underline-offset-4">{topic.title}</Link>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

