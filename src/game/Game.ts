import { AnyCurrencyMixin, Currency, createCurrency } from "../currency";
import { Producer } from "../producer";

export class Game {
	currencies: Currency[] = [];
	ticksPerSecond: number = 10;
	interval?: number;

	constructor({ tps }: { tps: number }) {
		this.ticksPerSecond = tps;
	}

	currency(
		name: string,
		params: Partial<{
			amount?: number;
			producers?: Producer[] | undefined;
			decimalPlaces?: number | undefined;
			mixins?: AnyCurrencyMixin[];
		}> = {}
	): Currency {
		const currency = createCurrency({
			amount: params.amount || 0,
			name,
			producers: params.producers || [],
			decimalPlaces: params.decimalPlaces || 2,
			mixins: params.mixins || [],
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
