import { Easing, getEasing } from "../util/easings";

export class DiminishingProducer {
	speed: number;
	multipliers: number[];
	diminish: {
		value: number;
		easing: (x: number) => number;
		ticksToZero: number;
		ticksPassed: number;
		shouldBeCleaned: boolean;
	} = {
		value: 0,
		easing: (x) => x,
		ticksToZero: 0,
		ticksPassed: 0,
		shouldBeCleaned: false,
	};

	constructor({
		speed,
		multipliers = [],
		easing = Easing.EaseOutCubic,
		ticksToZero,
	}: {
		speed: number;
		multipliers?: number[];
		easing: Easing;
		ticksToZero: number;
	}) {
		this.speed = speed;
		this.multipliers = multipliers;
		this.diminish.easing = getEasing(easing);
		this.diminish.value = 1;
		this.diminish.ticksToZero = ticksToZero;
	}

	update() {
		this.diminish.ticksPassed++;
		this.diminish.value = this.diminish.easing(
			1 - this.diminish.ticksPassed / this.diminish.ticksToZero
		);
		if (this.diminish.value === 0) {
			this.diminish.shouldBeCleaned = true;
		}
	}

	// TODO: Make tps a class value
	getTickValue(ticksPerSecond: number): number {
		if (this.diminish.shouldBeCleaned) return 0;
		let value = ticksPerSecond ? 1 / ticksPerSecond : 1;
		return (
			[this.speed, ...this.multipliers].reduce((a, b) => a * b) *
			value *
			this.diminish.value
		);
	}
}
