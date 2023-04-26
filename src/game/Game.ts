import { AnyCurrencyMixin, Currency, createCurrency } from "../currency";
import { Producer } from "../producer";

export class Game {
	currencies: Currency[] = [];
	ticksPerSecond: number = 10;
	interval?: number;

	constructor({ tps }: { tps: number }) {
		this.ticksPerSecond = tps;
	}

	createCurrency(
		mixins: AnyCurrencyMixin[],
		params: {
			amount: number;
			name: string;
			producers?: Producer[] | undefined;
			decimalPlaces?: number | undefined;
		}
	): Currency {
		const currency = createCurrency(mixins, {
			...params,
			ticksPerSecond: this.ticksPerSecond,
		});
		this.currencies.push(currency);
		return currency;
	}

	start(): this {
		this.interval = setInterval(() => {
			this.tick();
		}, 1000 / this.ticksPerSecond);
		return this;
	}

	stop() {
		if (this.interval) clearInterval(this.interval);
	}

	tick() {
		for (const currency of this.currencies) {
			currency.tick();
		}
	}
}
