'use client'

import { useEffect, useState } from "react";

export default function ClientTime({ datetime }: { datetime: Date }) {

    const [dateTimeString, setDateTimeString] = useState<string>("");

    useEffect(() => {
        setDateTimeString(datetime.toLocaleString());
    }, [datetime]);

    return (
        <time dateTime={datetime.toISOString()}>
            {dateTimeString}
        </time>
    )
}