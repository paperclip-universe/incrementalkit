import { DiminishingProducer } from "./DiminishingProducer";

export class SimpleProducer {
	speed: number;
	multipliers: number[];

	constructor({
		speed,
		multipliers = [],
	}: {
		speed: number;
		multipliers?: number[];
	}) {
		this.speed = speed;
		this.multipliers = multipliers;
	}

	getTickValue(ticksPerSecond: number): number {
		let value = ticksPerSecond ? 1 / ticksPerSecond : 1;
		return (
			[this.speed, ...this.multipliers].reduce((a, b) => a * b) * value
		);
	}
}
