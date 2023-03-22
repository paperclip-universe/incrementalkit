import { DiminishingProducer } from "./DiminishingProducer";

export class SimpleProducer {
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
		let tps = ticksPerSecond || this.ticksPerSecond;
		let value = tps ? 1 / tps : 1;
		return [this.speed, ...this.multipliers].reduce((a, b) => a * b) * value;
	}
}
