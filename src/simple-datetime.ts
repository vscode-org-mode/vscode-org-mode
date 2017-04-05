import * as vscode from 'vscode';

const weekdayArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface ISimpleDate {
    date: string;
    weekday: string;
}

export function parseDate(dateString: string): ISimpleDate {
    const dateReg = /\d{4}-\d{1,2}-\d{1,2}/;
    const dateResult = dateReg.exec(dateString);
    let date;
    if (dateResult) {
        date = dateResult[0];
    }

    const weekdayReg = /[A-Za-z]{3}/;
    const weekdayResult = weekdayReg.exec(dateString);
    let weekday;
    if (weekdayResult) {
        weekday = weekdayResult[0];
    }

    return { date, weekday };
};

export function isValidSimpleDate(datetime: ISimpleDate): boolean {
    return Boolean(datetime.date);
}

export function buildDateString(datetime: ISimpleDate): string {
    const { date, weekday } = datetime;

    let dateString = `${date}`;

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
        date: `${year}-${padVal(month.toString())}-${padVal(day.toString())}`,
        weekday
    }
}

export function currentDatetime(): ISimpleDate {
    const currentDate = new Date();

    return dateToSimpleDate(new Date());
}

export function modifyDate(dateString: string, action: string): string {
    const oldDate = parseDate(dateString);
    let dateObject = new Date(oldDate.date);

    switch (action) {
        case "UP":
            // By all accounts, this shouldn't work
            dateObject.setDate(dateObject.getDate() + 2);
            break;
        case "DOWN":
            // Or this
            // dateObject.setDate(dateObject.getDate());
            break;
        default:
            vscode.window.showErrorMessage(`No such action: ${action}`);
    }

    const newDate = dateToSimpleDate(dateObject);

    return buildDateString(newDate);
}

console.log(currentDatetime());