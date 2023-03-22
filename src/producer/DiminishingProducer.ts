import { Easing, getEasing } from "../util/easings";

export class DiminishingProducer {
	speed: number;
	multipliers: number[];
	ticksPerSecond: number;
	shouldBeCleaned: boolean = false;
	diminish: {
		value: number;
		easing: (x: number) => number;
		ticksToZero: number;
		ticksPassed: number;
	} = {
		value: 0,
		easing: (x) => x,
		ticksToZero: 0,
		ticksPassed: 0,
	};

	constructor({
		speed,
		multipliers = [],
		easing = Easing.EaseOutCubic,
		ticksToZero,
		ticksPerSecond,
	}: {
		speed: number;
		multipliers?: number[];
		easing: Easing;
		ticksToZero: number;
		ticksPerSecond: number;
	}) {
		this.speed = speed;
		this.multipliers = multipliers;
		this.diminish.easing = getEasing(easing);
		this.diminish.value = 1;
		this.diminish.ticksToZero = ticksToZero;
		this.ticksPerSecond = ticksPerSecond;
	}

	update() {
		this.diminish.ticksPassed++;
		this.diminish.value = this.diminish.easing(
			1 - this.diminish.ticksPassed / this.diminish.ticksToZero,
		);
		if (this.diminish.value === 0) {
			this.shouldBeCleaned = true;
		}
	}

	getTickValue(ticksPerSecond?: number): number {
		let tps = ticksPerSecond || this.ticksPerSecond;
		if (this.shouldBeCleaned) return 0;
		let value = tps ? 1 / tps : 1;
		return (
			[this.speed, ...this.multipliers].reduce((a, b) => a * b) *
			value *
			this.diminish.value
		);
	}
}
