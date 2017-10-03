import * as vscode from 'vscode';
import * as datefns from 'date-fns';
import * as Utils from './utils';

const weekdayArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface ISimpleDate {
    year: number;
    month: number;
    day: number;
    weekday: string;
}

export interface ISimpleDateTime extends ISimpleDate {
    hours: number;
    minutes: number;
}

export function parseDate(dateString: string): ISimpleDate {
    const dateRegExp = /(\d{4})-(\d{1,2})-(\d{1,2})/;
    const dateResult = dateRegExp.exec(dateString);
    let year, month, day;
    if (dateResult) {
        year = parseInt(dateResult[1]);
        month = parseInt(dateResult[2]);
        day = parseInt(dateResult[3]);
    }

    const weekdayRegExp = /[A-Za-z]{3}/;
    const weekdayResult = weekdayRegExp.exec(dateString);
    let weekday;
    if (weekdayResult) {
        weekday = weekdayResult[0];
    }

    return { year, month, day, weekday };
};

export function isValidSimpleDate(datetime: ISimpleDate): boolean {
    return Boolean(datetime.year) && Boolean(datetime.month) && Boolean(datetime.day);
}

export function buildDateString(datetime: ISimpleDate): string {
    const { year, month, day, weekday } = datetime;

    let dateString = `${year}-${month}-${day}`;
    if (Utils.getLeftZero()) {
        dateString = padDate(dateString);
    }        
    if (weekday) {
        dateString = `${dateString} ${weekday}`;
    }

    return `[${dateString}]`
};

export function buildDateTimeString(datetime: ISimpleDateTime): string {
    const { year, month, day, hours, minutes, weekday } = datetime;

    let dateString = `${year}-${month}-${day}`;
    let timeString = `${hours}:${minutes}`;
    if (Utils.getLeftZero()) {
        dateString = padDate(dateString);
        timeString = padTime(timeString);
    }
    if (weekday) {
        dateString = `${dateString} ${weekday}`;
    }


    return `[${dateString} ${timeString}]`
};

function padDate(str: string): string {
    let regex = /-(\d)(-|$)/;
    while (regex.exec(str) !== null) {
        str = str.replace(regex, '-0$1$2');
    }
    return str;
}

function padTime(str: string): string {
    let regex = /(^|:)(\d)(:|$)/;
    while (regex.exec(str) !== null) {
        str = str.replace(regex, '$10$2$3');
    }
    return str;
}

export function dateToSimpleDate(dateObject: Date): ISimpleDate {
    const year = dateObject.getFullYear();
    const month = dateObject.getMonth() + 1; // Why, Javascript, why!?
    const day = dateObject.getDate();

    const weekday = weekdayArray[dateObject.getDay()];

    return {
        year,
        month,
        day,
        weekday
    }
}

export function dateToSimpleDateTime(dateObject: Date): ISimpleDateTime {
    let simpleDateTime = dateToSimpleDate(dateObject) as ISimpleDateTime;
    simpleDateTime.hours = dateObject.getHours();
    simpleDateTime.minutes = dateObject.getMinutes();

    return simpleDateTime;
}

export function currentDate(): ISimpleDate {
    const currentDate = new Date();

    return dateToSimpleDate(new Date());
}

export function currentDateTime(): ISimpleDateTime {
    const currentDate = new Date();

    return dateToSimpleDateTime(new Date());
}

export function modifyDate(dateString: string, action: string): string {
    const oldDate = parseDate(dateString);
    let dateObject = datefns.parse(`${oldDate.year}-${oldDate.month}-${oldDate.day}`);

    if (action === "UP") {
        dateObject = datefns.addDays(dateObject, 1);
    }
    else {
        dateObject = datefns.addDays(dateObject, -1);
    }

    const newDate = dateToSimpleDate(dateObject);
    if (!oldDate.weekday) {
        newDate.weekday = undefined;
    }

    return buildDateString(newDate);
}

export function getClockTotal(line) {
    const separator = Utils.getClockTotalSeparator();

    const regex = /\d{1,2}:\d{1,2}/g;
    const match = line.match(regex);

    if (match.length < 2) return '';

    const clockIn = new Date(`2017-01-01 ${match[0]}`);
    const clockOut = new Date(`2017-01-01 ${match[1]}`);
    const clock = clockOut.getTime() - clockIn.getTime();
    const hours = Math.floor(clock/(60*60*1000));
    const minutes = clock/(60*1000) - (60*hours);

    let clockString = `${hours}:${minutes}`;
    if (Utils.getLeftZero()) {
        clockString = padTime(clockString);
    }

    return clockString;
}