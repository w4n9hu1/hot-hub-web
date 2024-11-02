'use client'

import { format } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function ClientTime({ datetime }: { datetime: Date }) {

    const [dateTimeString, setDateTimeString] = useState<string>("");

    useEffect(() => {
        setDateTimeString(format(datetime, "yyyy/MM/dd HH:mm:ss"));
    }, [datetime]);

    return (
        <time dateTime={datetime.toISOString()}>
            {dateTimeString}
        </time>
    )
}