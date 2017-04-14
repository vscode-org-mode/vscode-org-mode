import * as vscode from 'vscode';
import * as datefns from 'date-fns';

const weekdayArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface ISimpleDate {
    year: number;
    month: number;
    day: number;
    weekday: string;
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

    if (weekday) {
        dateString = `${dateString} ${weekday}`;
    }

    return `[${dateString}]`
};

function padVal(str: string): string {
    return str.length === 1 ? `0${str}` : str;
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

export function currentDatetime(): ISimpleDate {
    const currentDate = new Date();

    return dateToSimpleDate(new Date());
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