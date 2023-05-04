import { JSONObject, Serializable } from "../serialize/Serializable";
import { DiminishingMixin } from "./mixins/Diminishing";
import { z } from "zod";

export type AnyProducerMixin = DiminishingMixin<typeof Producer>;
export const ProducerSerializeSchema = z.object({
	speed: z.number(),
	multipliers: z.array(z.number()),
	ticksPerSecond: z.number(),
});

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
		return (
			[this.speed, ...this.multipliers].reduce((a, b) => a * b) * value
		);
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
		const data = ProducerSerializeSchema.parse(json);

		const producer = new Producer(data);

		return producer;
	}
}

export function createProducer(params: {
	speed: number;
	multipliers?: number[];
	ticksPerSecond: number;
	mixins: AnyProducerMixin[];
}): Producer {
	let producer = Producer;
	for (const mixin of params.mixins) {
		// REFACTOR - will have to do full
		// @ts-ignore
		producer = new mixin(producer);
	}

	return new producer(params);
}
