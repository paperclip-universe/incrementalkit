import { JSONObject, Serializable } from "../serialize/Serializable";
import { unwrap } from "../util/unwrap";
import { DiminishingMixin } from "./mixins/Diminishing";

export type AnyMixin = DiminishingMixin<typeof Producer>;

export class Producer implements Serializable<Producer> {
	speed: number;
	multipliers: number[];
	ticksPerSecond: number;
	shouldBeCleaned: boolean = false;

	constructor({
		speed,
		multipliers = [],
		ticksPerSecond,
	}: {
		speed: number;
		multipliers?: number[];
		ticksPerSecond: number;
	}) {
		this.speed = speed;
		this.multipliers = multipliers;
		this.ticksPerSecond = ticksPerSecond;
	}

	getTickValue(ticksPerSecond?: number): number {
		const tps = ticksPerSecond || this.ticksPerSecond;
		const value = tps ? 1 / tps : 1;
		return [this.speed, ...this.multipliers].reduce((a, b) => a * b) * value;
	}

	update() {}

	serialize(): JSONObject {
		return {
			speed: this.speed,
			multipliers: this.multipliers,
			ticksPerSecond: this.ticksPerSecond,
		};
	}

	deserialize(json: JSONObject): Producer {
		return new Producer({
			speed: unwrap(
				json.speed,
				"Speed is not defined in serialized data for producer.",
				"number",
				1,
			) as number,
			multipliers: unwrap(
				json.multipliers,
				"Multipliers is not defined in serialized data for producer.",
				"object",
				[],
			) as number[],
			ticksPerSecond: unwrap(
				json.ticksPerSecond,
				"Ticks per second is not defined in serialized data for producer.",
				"number",
				1,
			) as number,
		});
	}
}

export function createProducer(
	mixins: AnyMixin[],
	params: {
		speed: number;
		multipliers?: number[];
		ticksPerSecond: number;
	},
): Producer {
	let producer = Producer;
	for (const mixin of mixins) {
		// REFACTOR - will have to do full
		// @ts-ignore
		producer = new mixin(producer);
	}

	return new producer(params);
}
