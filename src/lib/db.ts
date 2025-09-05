/* eslint-disable @typescript-eslint/no-explicit-any */

import { QueryTopicResult, TopicTrends, WbHotTopic, WbHotTopicDetail } from "@/lib/type";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

interface HotTopicParams {
    days: number;
    pageSize?: number;
}

const cache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_DURATION = 60 * 60 * 1000;

// Mock data for demo purposes when database is not available
function getMockTopics(days: number): WbHotTopic[] {
    const mockTopics = [
        { rank: 1, title: "人工智能技术突破", hot: 950000, created_at: new Date() },
        { rank: 2, title: "新能源汽车市场增长", hot: 850000, created_at: new Date() },
        { rank: 3, title: "太空探索新发现", hot: 750000, created_at: new Date() },
        { rank: 4, title: "区块链技术应用", hot: 650000, created_at: new Date() },
        { rank: 5, title: "气候变化解决方案", hot: 550000, created_at: new Date() },
        { rank: 6, title: "量子计算进展", hot: 450000, created_at: new Date() },
        { rank: 7, title: "生物技术创新", hot: 350000, created_at: new Date() },
        { rank: 8, title: "虚拟现实体验", hot: 250000, created_at: new Date() },
        { rank: 9, title: "可持续发展目标", hot: 150000, created_at: new Date() },
        { rank: 10, title: "数字化转型趋势", hot: 100000, created_at: new Date() }
    ];

    if (days === 30) {
        return mockTopics.map(topic => ({
            ...topic,
            title: topic.title + " (月度)",
            hot: Math.floor(topic.hot * 0.8)
        }));
    }
    
    if (days === 365) {
        return mockTopics.map(topic => ({
            ...topic,
            title: topic.title + " (年度)",
            hot: Math.floor(topic.hot * 1.5)
        }));
    }
    
    return mockTopics;
}

function getMockMetrics() {
    return {
        dataCount: 12580,
        dateFrom: new Date('2023-01-01'),
        dateTo: new Date()
    };
}

async function getRecentTopics({ pageSize = 20, days }: HotTopicParams): Promise<WbHotTopic[]> {
    try {
        const client = await pool.connect();
        try {
            const querySql = `select
            min(rank) rank,
            title,
            max(hot) hot,
            min(created_at) created_at
            from
            wb_hot
            where
            created_at > current_date - interval '${days} days'
            and hot > 0
            and tag = ''
            group by
            title
            order by
            ${days === 0 ? 'created_at desc,' : ''}
            hot desc
            limit
            $1
            `;
            const result = await client.query<WbHotTopic>(querySql, [pageSize]);
            return result.rows;
        } catch (e) {
            throw e;
        } finally {
            client.release();
        }
    } catch (e) {
        // Return mock data when database is not available
        console.log('Database not available, using mock data');
        return getMockTopics(days).slice(0, pageSize);
    }
}

async function getTopicByTitle(title: string): Promise<WbHotTopicDetail[]> {
    const cacheKey = `${getTopicByTitle}_${title}`;
    const now = Date.now();

    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
        return cache[cacheKey].data;
    }

    const client = await pool.connect();
    try {
        const querySql = `select
        id,
        rank,
        title,
        hot,
        tag,
        icon,
        created_at
        from
        wb_hot
        where
        title = $1
        `;
        const result = await client.query<WbHotTopicDetail>(querySql, [title]);

        cache[cacheKey] = {
            data: result.rows,
            timestamp: now,
        };

        return result.rows;
    } catch (e) {
        throw e;
    } finally {
        client.release();
    }
}

interface QueryByTitle {
    query: string;
    pageSize?: number;
    currentPage?: number;
}

async function queryBytitle({ query, pageSize = 100, currentPage = 1 }: QueryByTitle): Promise<QueryTopicResult[]> {

    const cacheKey = `${queryBytitle}_${query}_${pageSize}_${currentPage}`;
    const now = Date.now();

    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
        return cache[cacheKey].data;
    }

    const client = await pool.connect();
    try {
        const querySql = `select
        title,
        sum(hot) total_hot,
        COALESCE(
            array_to_string(
            array_agg(DISTINCT icon) FILTER (
                WHERE
                icon != '' and icon != '新'
            ),
            ','
            ),
            ''
        ) AS icons,
        COALESCE(
            array_to_string(
            array_agg(DISTINCT tag) FILTER (
                WHERE
                tag != ''
            ),
            ','
            ),
            ''
        ) AS tags
        from
        wb_hot
        where
        tag !='top'
        and title like $1
        group by
        title
        order by
        total_hot desc
        limit
        $2
        offset
        $3
        `;
        const result = await client.query<QueryTopicResult>(querySql, [`%${query}%`, pageSize, (currentPage - 1) * pageSize]);

        cache[cacheKey] = {
            data: result.rows,
            timestamp: now,
        };

        return result.rows;
    } catch (e) {
        throw e;
    } finally {
        client.release();
    }
}

interface dataMetrics {
    dataCount: number;
    dateFrom: Date;
    dateTo: Date;
}

async function getDataMetrics(): Promise<dataMetrics> {
    try {
        const client = await pool.connect();
        try {
            const dataCountPromise = client.query('select count(*) count from wb_hot');
            const dateFromPromise = client.query('select min(created_at) mindate from wb_hot');
            const dateToPromise = client.query('select max(created_at) maxdate from wb_hot');

            const dataMetrics = await Promise.all([dataCountPromise, dateFromPromise, dateToPromise]);

            return {
                dataCount: parseInt(dataMetrics[0].rows[0].count),
                dateFrom: dataMetrics[1].rows[0].mindate,
                dateTo: dataMetrics[2].rows[0].maxdate,
            };

        } catch (e) {
            throw e;
        } finally {
            client.release();
        }
    } catch (e) {
        // Return mock data when database is not available
        console.log('Database not available, using mock metrics');
        return getMockMetrics();
    }
}

async function getTopicTrends({ query }: { query: string }): Promise<TopicTrends[]> {

    const cacheKey = `${queryBytitle}_${query}`;
    const now = Date.now();

    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
        return cache[cacheKey].data;
    }

    const client = await pool.connect();
    try {
        const querySql = `SELECT 
    dates.date,
    COALESCE(FLOOR(max(hot) / 1000.0), 0) AS hots
FROM 
    generate_series(
        DATE_TRUNC('day', NOW() - INTERVAL '1 year'), 
        DATE_TRUNC('day', NOW()), 
        INTERVAL '1 day'
    ) AS dates(date)
LEFT JOIN 
    wb_hot ON DATE_TRUNC('day', wb_hot.created_at) = dates.date
          AND title LIKE $1
          AND tag != 'top'
GROUP BY 
    dates.date
ORDER BY 
    dates.date;
`;
        const result = await client.query<TopicTrends>(querySql, [`%${query}%`]);

        cache[cacheKey] = {
            data: result.rows,
            timestamp: now,
        };

        return result.rows;
    } catch (e) {
        throw e;
    } finally {
        client.release();
    }
}

export { getRecentTopics, getTopicByTitle, queryBytitle, getDataMetrics, getTopicTrends };