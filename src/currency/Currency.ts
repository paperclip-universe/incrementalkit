import { AnyProducer } from "../producer/Producer";
import { SimpleProducer } from "../producer/SimpleProducer";

export class Currency {
	value: number;
	name: string;
	producers: AnyProducer[];

	constructor({
		value,
		name,
		producers = [],
	}: {
		value: number;
		name: string;
		producers?: AnyProducer[];
	}) {
		this.value = value;
		this.name = name;
		this.producers = producers;
	}

	addProducer(speed: number, multipliers?: number[]) {
		this.producers.push(
			new SimpleProducer({
				speed,
				multipliers,
			})
		);
	}

	getTickValue(ticksPerSecond: number): number {
		return this.producers
			.map((x) => x.getTickValue(ticksPerSecond))
			.reduce((a, b) => a + b, 0);
	}

	tick(ticksPerSecond: number) {
		this.value = this.getTickValue(ticksPerSecond);
	}

	get perSecondEarnings() {
		return this.getTickValue(1);
	}
}
