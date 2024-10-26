import { TrendBarChart } from "@/components/bar-chart";
import { getTopicTrends, queryBytitle } from "@/lib/db";
import { QueryTopicResult, TopicTrends } from "@/lib/type";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "搜索 - 热点话题榜",
};

export default async function Page({ searchParams }: {
    searchParams: {
        query: string;
    }
}) {

    const relatedTopics: QueryTopicResult[] = await queryBytitle({ query: searchParams.query });
    const topicTrends: TopicTrends[] = await getTopicTrends({ query: searchParams.query });

    return (
        <div className="flex flex-col gap-8">
            <p className="text-lg font-bold">{searchParams.query} - 搜索结果:</p>
            {
                relatedTopics.length === 0 && <p>暂无相关话题。</p>
            }
            <TrendBarChart chartData={topicTrends} />
            <div className="flex flex-col gap-4">
                {
                    relatedTopics.map((topic, index) => (
                        <div key={index} className="flex">
                            <div className="items-start flex-1">
                                {index + 1 + ". "}
                                <Link prefetch={false} className=" hover:underline underline-offset-4" href={`/topic/${topic.title}`}>
                                    {topic.title}
                                </Link>
                                {
                                    topic.icons.split(",").map((icon, index) => (
                                        <span className="mx-1 text-sm font-bold text-red-600" key={index}>{icon}</span>
                                    ))
                                }
                                {
                                    topic.tags.split(",").map((tag, index) => (
                                        <span className="mx-1 text-sm font-bold text-blue-600" key={index}>{tag}</span>
                                    ))
                                }
                            </div>
                            <div className="flex items-start shrink-0">
                                <span>{topic.total_hot}</span>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}