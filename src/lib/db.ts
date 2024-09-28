/* eslint-disable @typescript-eslint/no-explicit-any */

import { QueryTopicResult, WbHotTopic, WbHotTopicDetail } from "@/lib/type";
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

async function getRecentTopics({ pageSize = 20, days }: HotTopicParams): Promise<WbHotTopic[]> {
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
}

export { getRecentTopics, getTopicByTitle, queryBytitle, getDataMetrics };