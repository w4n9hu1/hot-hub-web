export type WbHotTopic = {
    rank: number;
    title: string;
    hot: number;
    created_at: Date;
};

export type WbHotTopicDetail = {
    id: number;
    rank: number;
    title: string;
    hot: number;
    tag?: string;
    icon?: string;
    created_at: Date;
};

export type QueryTopicResult = {
    title: string;
    total_hot: number;
    icons: string;
    tags: string;
};

export type TopicTrends = {
    date: Date;
    hots: number;
};
