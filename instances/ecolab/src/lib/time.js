"use strict";

const { DateTime } = require("luxon");

const CHILE_TZ = "America/Santiago";

function getChileNow(fromDate) {
    if (fromDate instanceof Date) {
        return DateTime.fromJSDate(fromDate, { zone: CHILE_TZ });
    }
    if (fromDate && typeof fromDate === 'object' && typeof fromDate.toJSDate === 'function') {
        return DateTime.fromJSDate(fromDate.toJSDate(), { zone: CHILE_TZ });
    }
    return DateTime.now().setZone(CHILE_TZ);
}

function getChileTodayISODate(fromDate) {
    return getChileNow(fromDate).toISODate();
}

function getNextChileMidnight(fromDate) {
    const nowCl = getChileNow(fromDate);
    const nextMidnight = nowCl.plus({ days: 1 }).startOf("day");
    return new Date(nextMidnight.toMillis());
}

function msUntilNextChileMidnight(fromDate) {
    const nowCl = getChileNow(fromDate);
    const nextMidnight = nowCl.plus({ days: 1 }).startOf("day");
    return Math.max(1, nextMidnight.toMillis() - nowCl.toMillis());
}

function formatChile(date) {
    return getChileNow(date).toFormat("yyyy-LL-dd HH:mm ZZZZ");
}

module.exports = {
    CHILE_TZ,
    getChileNow,
    getChileTodayISODate,
    getNextChileMidnight,
    msUntilNextChileMidnight,
    formatChile
};


