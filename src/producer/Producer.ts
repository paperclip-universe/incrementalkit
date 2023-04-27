import { Schema, Type } from "../serialize/schema";
import { JSONObject, Serializable } from "../serialize/Serializable";
import { DiminishingMixin } from "./mixins/Diminishing";

export type AnyProducerMixin = DiminishingMixin<typeof Producer>;
export const ProducerSerializeSchema: Schema = {
	speed: Type.Number,
	multipliers: Type.Array(Type.Number),
	ticksPerSecond: Type.Number,
};

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

	static deserialize(json: JSONObject): Producer {
		const [valid, diagnostic] = Type.validateSchema(
			ProducerSerializeSchema,
			json
		);

		if (!valid) throw new Error(diagnostic);

		// TODO: typesafe schema validation
		// @ts-ignore
		const producer = new Producer(json);

		for (const key in json) {
			// @ts-ignore
			producer[key] = json[key];
		}

		return producer;
	}
}

export function createProducer(
	mixins: AnyProducerMixin[],
	params: {
		speed: number;
		multipliers?: number[];
		ticksPerSecond: number;
	}
): Producer {
	let producer = Producer;
	for (const mixin of mixins) {
		// REFACTOR - will have to do full
		// @ts-ignore
		producer = new mixin(producer);
	}

	return new producer(params);
}
