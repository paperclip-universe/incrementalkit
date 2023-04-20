import { DiminishingMixin } from "./mixins/Diminishing";

export type AnyMixin = DiminishingMixin<typeof Producer>;

export class Producer {
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
