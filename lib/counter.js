"use strict";

const fs = require("fs").promises;
const path = require("path");
const { DateTime } = require("luxon");
const {
	CHILE_TZ,
	getChileTodayISODate,
	formatChile
} = require("./time");

const DEFAULT_DATA_FILE = path.join(__dirname, "..", "data.json");
function getDataFilePath() {
	return process.env.DATA_FILE_PATH || DEFAULT_DATA_FILE;
}

async function loadData() {
	try {
		const raw = await fs.readFile(getDataFilePath(), "utf8");
		const parsed = JSON.parse(raw);
		// Migrate legacy fields to `lastRunChileDate`
		if (!parsed.lastRunChileDate) {
			let derived;
			if (parsed.ultimoIncremento) {
				const parsedLegacy = new Date(parsed.ultimoIncremento);
				if (!isNaN(parsedLegacy.getTime())) {
					derived = getChileTodayISODate(parsedLegacy);
				}
			}
			parsed.lastRunChileDate = derived || getChileTodayISODate();
			await saveData(parsed);
		}
		return parsed;
	} catch (error) {
		// Initialize default data if file missing/corrupt
		const todayCl = getChileTodayISODate();
		const defaultData = {
			diasSinAccidentes: 0,
			ultimaActualizacion: new Date().toISOString(),
			lastRunChileDate: todayCl,
			ultimoIncremento: todayCl,
			// Optional manual previous record set via admin panel
			recordAnterior: null
		};
		await saveData(defaultData);
		return defaultData;
	}
}

async function saveData(data) {
	const toPersist = { ...data };
	// Keep legacy field in sync for human readability/backward compatibility
	if (toPersist.lastRunChileDate) {
		toPersist.ultimoIncremento = toPersist.lastRunChileDate;
	}
	await fs.writeFile(getDataFilePath(), JSON.stringify(toPersist, null, 2));
	return true;
}

function calculateDaysDiffExclusive(fromISO, toISO) {
	if (!fromISO || !toISO) return 0;
	const from = DateTime.fromISO(fromISO, { zone: CHILE_TZ }).startOf("day");
	const to = DateTime.fromISO(toISO, { zone: CHILE_TZ }).startOf("day");
	const diffDays = Math.floor(to.diff(from, "days").days);
	return Math.max(0, diffDays);
}

async function ensureDailyIncrement(nowDate) {
	const data = await loadData();
	const todayClISO = getChileTodayISODate(nowDate);
	let incrementsApplied = 0;

	if (!data.lastRunChileDate) {
		data.lastRunChileDate = todayClISO;
		data.ultimaActualizacion = new Date().toISOString();
		await saveData(data);
		return { data, incrementsApplied };
	}

	const daysToAdd = calculateDaysDiffExclusive(data.lastRunChileDate, todayClISO);
	if (daysToAdd > 0) {
		data.diasSinAccidentes += daysToAdd;
		data.lastRunChileDate = todayClISO;
		data.ultimaActualizacion = new Date().toISOString();
		await saveData(data);
		incrementsApplied = daysToAdd;
	}

	return { data, incrementsApplied };
}

module.exports = {
	getDataFilePath,
	loadData,
	saveData,
	ensureDailyIncrement,
	calculateDaysDiffExclusive,
	formatChile
};


