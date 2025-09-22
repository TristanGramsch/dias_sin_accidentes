"use strict";

const { msUntilNextChileMidnight, formatChile } = require("./time");

class ChileMidnightScheduler {
	constructor(onTick, logger = console) {
		this.onTick = onTick;
		this.logger = logger;
		this.timeout = null;
		this.running = false;
	}

	start() {
		if (this.running) return;
		this.running = true;
		this._scheduleNext("start");
	}

	stop() {
		this.running = false;
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}
	}

	_scheduleNext(reason) {
		if (!this.running) return;
		const delayMs = msUntilNextChileMidnight();
		this.logger.log(`⏰ Scheduling next Chile midnight tick in ${Math.round(delayMs/1000)}s (reason: ${reason})`);
		this.timeout = setTimeout(async () => {
			try {
				await this.onTick();
				this.logger.log(`✅ Midnight tick executed at ${formatChile(new Date())}`);
			} catch (err) {
				this.logger.error("❌ Error in midnight tick:", err);
			} finally {
				this._scheduleNext("post-tick");
			}
		}, delayMs);
	}
}

module.exports = { ChileMidnightScheduler };


