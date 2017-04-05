export interface ISimpleDate {
    date: string;
    day: string;
}

export function parseDate(dateStr: string): ISimpleDate {
    const dateReg = /\d{4}-\d{1,2}-\d{1,2}/;
    const dateResult = dateReg.exec(dateStr);
    let date;
    if (dateResult) {
        date = dateResult[0];
    }

    const dayReg = /[A-Za-z]{3}/;
    const dayResult = dayReg.exec(dateStr);
    let day;
    if (dayResult) {
        day = dayResult[0];
    }

    return { date, day };
};

export function isValidSimpleDate(datetime: ISimpleDate): boolean {
    return Boolean(datetime.date);
}

export function buildDateString(datetime: ISimpleDate): string {
    const { date, day } = datetime;

    let dateString = `${date}`;

    if (day) {
        dateString = `${dateString} ${day}`;
    }

    return `[${dateString}]`
};

function padVal(str: string): string {
    return str.length === 1 ? `0${str}` : str;
}

export function currentDatetime(): ISimpleDate {
    const currentDate = new Date();
    const dayArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // Why, Javascript, why!?
    const date = currentDate.getDate();

    const day = dayArray[currentDate.getDay()];

    return {
        date: `${year}-${padVal(month.toString())}-${padVal(date.toString())}`,
        day
    }
}

console.log(currentDatetime());