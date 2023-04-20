import { AnyProducer } from "../producer";
import { Producer } from "../producer/Producer";
import { LinkedMixin } from "./mixins/Linked";

export type AnyMixin = LinkedMixin<typeof Currency>;

/**
 * A currency is a resource that can be earned and spent.
 * It has a value, a name, and a list of producers.
 *
 * @param amount The amount of the currency
 * @param name The name of the currency
 * @param producers The producers producing the currency
 * @param ticksPerSecond The amount of ticks per second
 */
export class Currency {
	amount: number;
	name: string;
	producers: AnyProducer[];
	ticksPerSecond: number;
	decimalPlaces: number;

	constructor({
		amount,
		name,
		producers = [],
		ticksPerSecond,
		decimalPlaces = 1,
	}: {
		amount: number;
		name: string;
		producers?: AnyProducer[];
		ticksPerSecond: number;
		decimalPlaces?: number;
	}) {
		this.amount = amount;
		this.name = name;
		this.producers = producers;
		this.ticksPerSecond = ticksPerSecond;
		this.decimalPlaces = decimalPlaces;
	}

	/**
	 * Adds a simple producer to the list of producers.
	 *
	 * @param speed The speed of the producer
	 * @param multipliers The multipliers of the producer
	 */
	addProducer(speed: number, multipliers?: number[]) {
		this.producers.push(
			new Producer({
				speed,
				multipliers,
				ticksPerSecond: this.ticksPerSecond,
			})
		);
	}

	/**
	 * Gets the amount of money that will be added in one tick.
	 *
	 * @returns The amount of money that will be added in one tick
	 */
	getTickValue(ticksPerSecond?: number): number {
		return this.producers
			.map((x) => {
				return x.getTickValue(ticksPerSecond);
			})
			.reduce((a, b) => a + b, 0);
	}

	/**
	 * Does a full update of the currency.
	 */
	tick() {
		this.producers.forEach((x) => {
			// @ts-ignore
			if (x.update) x.update();
		});

		this.amount = Number(
			(this.amount + this.getTickValue()).toFixed(this.decimalPlaces)
		);
	}

	/**
	 * Cleans the producers that should be cleaned.
	 * This should be called at a regular interval.
	 */
	clean() {
		this.producers = this.producers.filter((x) => !x.shouldBeCleaned);
	}

	/**
	 * Gets the amount of money that will be added per second.
	 */
	get perSecondEarnings() {
		return this.getTickValue(1);
	}
}

export function createCurrency(
	mixins: AnyMixin[],
	params: {
		amount: number;
		name: string;
		producers?: AnyProducer[];
		ticksPerSecond: number;
		decimalPlaces?: number;
	}
): Currency {
	let currency = Currency;
	for (const mixin of mixins) {
		// REFACTOR - will have to do full
		// @ts-ignore
		currency = new mixin(currency);
	}

	return new currency(params);
}
