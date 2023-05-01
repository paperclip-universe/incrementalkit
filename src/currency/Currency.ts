import { Producer } from "../producer/Producer";
import { JSONObject, Schema, Type } from "../serialize";
import { Serializable } from "../serialize/Serializable";
import { LinkedMixin } from "./mixins/Linked";

export type CurrencySerializeData = {
	mixins: AnyCurrencyMixin[];
};
export type AnyCurrencyMixin = LinkedMixin<typeof Currency>;

export const CurrencySerializeSchema: Schema = {
	amount: Type.Number,
	name: Type.String,
	producers: Type.Array(Type.Class(Producer)),
	decimalPlaces: Type.Number,
	interval: Type.Number,
	_ticksPerSecond: Type.Number,
	_serializeData: Type.Object,
};

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

	_serializeData?: CurrencySerializeData;

	constructor({
		amount,
		name,
		producers = [],
		ticksPerSecond,
		decimalPlaces = 1,
		_serializeData,
	}: {
		amount: number;
		name: string;
		producers?: Producer[];
		ticksPerSecond: number;
		decimalPlaces?: number;
		_serializeData?: CurrencySerializeData;
	}) {
		this.amount = amount;
		this.name = name;
		this.producers = producers;
		this.decimalPlaces = decimalPlaces;
		this.interval = undefined;
		this._ticksPerSecond = ticksPerSecond;
		this._serializeData = _serializeData;
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
		const [valid, diagnostic] = Type.validateSchema(
			CurrencySerializeSchema,
			json
		);
		if (!valid) throw new Error(diagnostic);

		for (const key in json) {
			// @ts-ignore
			this[key] = json[key];
		}

		return this;
	}
}

export function createCurrency(params: {
	amount: number;
	name: string;
	producers?: Producer[];
	ticksPerSecond: number;
	decimalPlaces?: number;
	mixins: AnyCurrencyMixin[];
}): Currency {
	let currency = Currency;
	for (const mixin of params.mixins) {
		// REFACTOR - will have to do full
		// @ts-ignore
		currency = new mixin(currency);
	}

	return new currency({
		...params,
		_serializeData: { mixins: params.mixins },
	});
}
