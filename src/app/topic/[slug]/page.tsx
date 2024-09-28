
import ClientTime from "@/components/client-time";
import { getTopicByTitle } from "@/lib/db";
import { Metadata } from "next";
import { notFound } from 'next/navigation'

export async function generateMetadata(
    { params }: { params: { slug: string } }
): Promise<Metadata> {
    return {
        title: decodeURIComponent(params.slug) + " - 热点话题榜",
    }
}

export default async function Page({ params }: { params: { slug: string } }) {

    const topicTitle = decodeURIComponent(params.slug);
    const topicDetail = await getTopicByTitle(topicTitle);

    if (topicDetail.length === 0) {
        return notFound();
    }

    topicDetail.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

    const firstTopic = topicDetail[0];
    const lastTopic = topicDetail[topicDetail.length - 1];

    const duration = parseFloat(((lastTopic.created_at.getTime() - firstTopic.created_at.getTime()) / 1000 / 60 / 60).toFixed(2));
    const topRank = Math.min(...topicDetail.map(item => item.rank));
    const tags = [...new Set(topicDetail.map(item => item.tag))].filter(tag => tag);
    const icons = [...new Set(topicDetail.map(item => item.icon))].filter(icon => icon);

    return (
        <div className="flex flex-col gap-4">
            <p className="text-lg font-bold">{topicTitle}
                {
                    icons.map((icon, index) => (
                        <span className="mx-1 text-sm text-red-600" key={index}>{icon}</span>
                    ))
                }
                {
                    tags.map((tag, index) => (
                        <span className="mx-1 text-sm text-blue-600" key={index}>{tag}</span>
                    ))
                }
            </p>

            <p className="text-sm font-normal text-muted-foreground"><ClientTime datetime={firstTopic.created_at} /> ~ <ClientTime datetime={lastTopic.created_at} /></p>

            <div className="grid gap-8 md:grid-cols-3">

                <TopicMetricCard title="最高排名" value={topRank} unit="名" />
                <TopicMetricCard title="持续时间" value={duration} unit="小时" />
                <TopicMetricCard title="上榜次数" value={topicDetail.length} unit="次" />

            </div>
        </div >
    )
}

function TopicMetricCard({ title, value, unit }: { title: string, value: number, unit: string }) {
    return (
        <div>
            <p className="mb-2">{title}</p>
            <div className="flex items-baseline gap-1 text-3xl font-bold leading-none tabular-nums">
                {value}
                <span className="text-sm font-normal text-muted-foreground">
                    {unit}
                </span>
            </div>
        </div>
    )
}
