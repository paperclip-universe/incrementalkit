import { AnyMixin, Currency, createCurrency } from "../currency";
import { Producer } from "../producer";

export class Game {
	currencies: Currency[] = [];
	ticksPerSecond: number = 10;
	interval?: number;

	constructor() {}

	createCurrency(
		mixins: AnyMixin[],
		params: {
			amount: number;
			name: string;
			producers?: Producer[] | undefined;
			ticksPerSecond: number;
			decimalPlaces?: number | undefined;
		},
	) {
		this.currencies.push(createCurrency(mixins, params));
	}

	start() {
		this.interval = setInterval(() => {
			this.tick();
		}, 1000 / this.ticksPerSecond);
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
