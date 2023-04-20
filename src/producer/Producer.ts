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
		let tps = ticksPerSecond || this.ticksPerSecond;
		let value = tps ? 1 / tps : 1;
		return (
			[this.speed, ...this.multipliers].reduce((a, b) => a * b) * value
		);
	}
}

export function createProducer(
	mixins: AnyMixin[],
	params: {
		amount: number;
		name: string;
		ticksPerSecond: number;
		decimalPlaces?: number;
	}
): Producer {
	let producer = Producer;
	for (const mixin of mixins) {
		// REFACTOR - will have to do full
		// @ts-ignore
		producer = new producer(currency);
	}

	return new producer(params);
}
