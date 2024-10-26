"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { TopicTrends } from "@/lib/type"
import { format } from "@/lib/utils"

export const description = "A simple area chart"

const chartConfig = {
    hot: {
        label: "hots",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export function TrendBarChart({ chartData }: { chartData: TopicTrends[] }) {
    const maxYValue = Math.ceil(Math.max(...chartData.map((item) => item.hots)) / 1000) * 1000;

    return (
        <div>
            <ChartContainer config={chartConfig} className="w-full h-[260px]">
                <BarChart
                    accessibilityLayer
                    data={chartData}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => format(value, "yy/MM/dd")}
                    />
                    <YAxis type="number" domain={[0, maxYValue]} />
                    <ChartTooltip
                        content={<ChartTooltipContent indicator="line" />}
                    />
                    <Bar
                        dataKey="hots"
                        fill="var(--color-hot)"
                    />
                </BarChart >
            </ChartContainer>
        </div>
    )
}
