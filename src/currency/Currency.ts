import {
	Producer,
	ProducerSerializeSchema,
	createProducer,
} from "../producer/Producer";
import { JSONObject } from "../serialize";
import { Serializable } from "../serialize/Serializable";
import { LinkedMixin } from "./mixins/Linked";
import { z } from "zod";

export const CurrencySerializeSchema = z.object({
	amount: z.number(),
	name: z.string().nonempty(),
	producers: z.array(ProducerSerializeSchema),
	decimalPlaces: z.number().int(),
	ticksPerSecond: z.number(),
});

export type AnyCurrencyMixin = LinkedMixin<typeof Currency>;

/**
 * A currency is a resource that can be earned and spent.
 * It has a value, a name, and a list of producers.
 *
 * @param amount The amount of the currency
 * @param name The name of the currency
 * @param producers The producers producing the currency
 * @param ticksPerSecond The amount of ticks per second
 */
export class Currency implements Serializable<Currency> {
	amount: number;
	name: string;
	producers: Producer[];
	decimalPlaces: number;
	interval?: number;

	_ticksPerSecond: number;

	constructor({
		amount,
		name,
		producers = [],
		ticksPerSecond,
		decimalPlaces = 1,
	}: {
		amount: number;
		name: string;
		producers?: Producer[];
		ticksPerSecond: number;
		decimalPlaces?: number;
	}) {
		this.amount = amount;
		this.name = name;
		this.producers = producers;
		this.decimalPlaces = decimalPlaces;
		this.interval = undefined;
		this._ticksPerSecond = ticksPerSecond;
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
				ticksPerSecond: this._ticksPerSecond,
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
	 * Uses `setInterval` to call `tick` at a regular interval. Should only be used for extremely simple games/testing. For larger games, use a `Game` loop.
	 */
	start() {
		this.interval = setInterval(() => {
			this.tick();
		}, 1000 / this._ticksPerSecond);
	}

	/**
	 * Stops the interval.
	 */
	stop() {
		if (this.interval) clearInterval(this.interval);
	}

	set ticksPerSecond(value: number) {
		this.stop();
		this._ticksPerSecond = value;
		this.start();
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

	serialize(): JSONObject {
		return {
			amount: this.amount,
			name: this.name,
			producers: this.producers.map((x) => x.serialize()),
			decimalPlaces: this.decimalPlaces,
			ticksPerSecond: this._ticksPerSecond,
		};
	}

	deserialize(json: JSONObject): Currency {
		// TODO: Better validation
		const data = CurrencySerializeSchema.parse(json);

		this.amount = data.amount;
		this.decimalPlaces = data.decimalPlaces;
		this.name = data.name;
		this._ticksPerSecond = data.ticksPerSecond;
		this.producers = data.producers.map((producer) =>
			createProducer({ ...producer, mixins: [] })
		);

		return this;
	}
}

export function createCurrency(params: {
	amount: number;
	name: string;
	producers?: Producer[];
	ticksPerSecond: number;
	decimalPlaces?: number;
	mixins?: AnyCurrencyMixin[];
}): Currency {
	let currency = Currency;
	for (const mixin of params.mixins || []) {
		// REFACTOR - will have to do full
		// @ts-ignore
		currency = new mixin(currency);
	}

	return new currency({
		...params,
	});
}
