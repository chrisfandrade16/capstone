/**
 * Used for the availability picker on the calendar function on the shop side of the website
 */

type RecurrenceFrequency = "YEARLY" | "MONTHLY" | "WEEKLY" | "DAILY" | "HOURLY";

type RecurrenceRule = {
    freq: RecurrenceFrequency;
    interval?: number;
    count?: number;
    until?: Date;
    byMonth?: number[];
    byMonthDay?: number[];
    byWeekDay?: string[];
    byHour?: number[];
};

export function humanReadableRRule(rruleStr: string): string {
    const rrule = parseRRule(rruleStr);
    const { freq, interval, count, until, byMonth, byMonthDay, byWeekDay, byHour } = rrule;

    let parts: string[] = [];

    switch (freq) {
        case "YEARLY":
            parts.push(interval === 1 ? "Every year" : `Every ${interval} years`);
            if (byMonth?.length) {
                const monthNames = byMonth.map((month) => new Date(0, month - 1).toLocaleString("default", { month: "long" }));
                const months = joinArrayWithConjunction(monthNames);
                parts.push(`in ${months}`);
            }
            break;
        case "MONTHLY":
            parts.push(interval === 1 ? "Every month" : `Every ${interval} months`);
            if (byMonthDay?.length) {
                parts.push(`on the ${joinArrayWithConjunction(byMonthDay)}${getOrdinalSuffix(byMonthDay)}`);
            }
            if (byWeekDay?.length) {
                const weekDays = byWeekDay.map((day) => formatWeekday(day));
                parts.push(`on ${joinArrayWithConjunction(weekDays)}`);
            }
            break;
        case "WEEKLY":
            parts.push("Every week");
            if (byWeekDay?.length) {
                const weekDays = byWeekDay.map((day) => formatWeekday(day, true));
                parts.push(`on ${joinArrayWithConjunction(weekDays)}`);
            }
            break;
        case "DAILY":
            parts.push(interval === 1 ? "Every day" : `Every ${interval} days`);
            break;
        case "HOURLY":
            parts.push(interval === 1 ? "Every hour" : `Every ${interval} hours`);
            if (byHour?.length) {
                parts.push(`at ${joinArrayWithConjunction(byHour.map((hour) => `${hour}:00`))}`);
            }
            break;
    }

    if (count) {
        parts.push(`for ${count} occurrences`);
    } else if (until) {
        const untilStr = until.toLocaleString("default", { dateStyle: "long" });
        parts.push(`until ${untilStr}`);
    }

    return parts.join(" ");
}

function parseRRule(rruleStr: string): RecurrenceRule {
    const parts = rruleStr.split(";");
    const freq = parts.find((part) => part.startsWith("FREQ="))?.split("=")[1] as RecurrenceFrequency;
    const interval = Number(parts.find((part) => part.startsWith("INTERVAL="))?.split("=")[1]) || undefined;
    const count = Number(parts.find((part) => part.startsWith("COUNT="))?.split("=")[1]) || undefined;
    const untilStr = parts.find((part) => part.startsWith("UNTIL="))?.split("=")[1];
    const until = untilStr ? new Date(untilStr) : undefined;
    const byMonth = parseListParam(parts.find((part) => part.startsWith("BYMONTH="))?.split("=")[1]);
    const byMonthDay = parseListParam(parts.find((part) => part.startsWith("BYMONTHDAY="))?.split("=")[1]);
    const byWeekDay = parseListParam(parts.find((part) => part.startsWith("BYDAY="))?.split("=")[1]);
    const byHour = parseListParam(parts.find((part) => part.startsWith("BYHOUR="))?.split("=")[1]);

    return { freq, interval, count, until, byMonth, byMonthDay, byWeekDay, byHour };
}

function parseListParam(paramStr?: string): number[] {
    if (!paramStr) {
        return [];
    }
    return paramStr.split(",").map((value) => Number(value));
}

function joinArrayWithConjunction(arr: string[], conjunction = "and"): string {
    if (arr.length === 0) {
        return "";
    }
    if (arr.length === 1) {
        return arr[0];
    }
    if (arr.length === 2) {
        return arr.join(`${conjunction}`);
    }
    const last = arr.pop();
    return `${arr.join(", ")}, ${conjunction} ${last}`;
}

function getOrdinalSuffix(days: number[]) {
    const suffixes = days.map((day) => {
        const ones = day % 10;
        const tens = Math.floor(day / 10) % 10;
        if (tens === 1 || ones === 0 || ones > 3) {
            return "th";
        }
        if (ones === 1) {
            return "st";
        }
        if (ones === 2) {
            return "nd";
        }
        if (ones === 3) {
            return "rd";
        }
    });
    return suffixes.length === 1 ? suffixes[0] : (`${suffixes.join(", ")}`);
}

function formatWeekday(weekday: string, useAbbreviation = false): string {
    const [, positionStr, dayStr] = weekday.match(/^(\d)?([A-Z]{2})$/)!;
    const position = positionStr ? Number(positionStr) : undefined;
    const dayName = new Date(0, 0, new Date().getDay() + ["SU", "MO", "TU", "WE", "TH", "FR", "SA"].indexOf(dayStr))
        .toLocaleString("default", { weekday: useAbbreviation ? "short" : "long" });
    return position ? `${formatOrdinal(position)} ${dayName}` : dayName;
}

function formatOrdinal(num: number) {
    const ones = num % 10;
    const tens = Math.floor(num / 10) % 10;
    if (tens === 1 || ones === 0 || ones > 3) {
        return `${num}th`;
    }
    if (ones === 1) {
        return `${num}st`;
    }
    if (ones === 2) {
        return `${num}nd`;
    }
    if (ones === 3) {
        return `${num}rd`;
    }
}