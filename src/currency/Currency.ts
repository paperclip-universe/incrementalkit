import { AnyProducer } from "../producer";
import { SimpleProducer } from "../producer/SimpleProducer";

export type Mixin = (currency: Currency) => never;

/**
 * A currency is a resource that can be earned and spent.
 * It has a value, a name, and a list of producers.
 *
 * @param amount The amount of the currency
 * @param name The name of the currency
 * @param producers The producers producing the currency
 * @param ticksPerSecond The amount of ticks per second
 */
export abstract class Currency {
	amount: number;
	name: string;
	producers: AnyProducer[];
	ticksPerSecond: number;
	decimalPlaces: number;
	systems: (inp: Currency) => Currency[];

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
		console.log("Adding producer", speed, multipliers);
		this.producers.push(
			new SimpleProducer({
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
				console.log(
					"Getting tick value",
					x,
					x.getTickValue(ticksPerSecond)
				);
				return x.getTickValue(ticksPerSecond);
			})
			.reduce((a, b) => a + b, 0);
	}

	/**
	 * Does a full update of the currency.
	 */
	tick() {
		console.log("Ticking", this.getTickValue());

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
