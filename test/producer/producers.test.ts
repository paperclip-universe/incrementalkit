import { Diminishing, createProducer } from "../../src";
import { describe, expect, it } from "vitest";
import { Easing } from "../../src/util/easings";

describe("SimpleProducer", () => {
	it("SimpleProducer", () => {
		const producer = createProducer({
			speed: 1,
			ticksPerSecond: 1,
		});

		expect(producer.getTickValue(1)).toBe(1);
		expect(producer.getTickValue()).toBe(1);
	});

	it("Serialize/deserialize", () => {
		const producer = createProducer({
			speed: 1,
			ticksPerSecond: 1,
		});

		expect(producer.serialize()).toStrictEqual({
			multipliers: [],
			speed: 1,
			ticksPerSecond: 1,
		});

		expect(
			createProducer({
				speed: 1,
				ticksPerSecond: 1,
			}).deserialize({
				multipliers: [],
				speed: 1,
				ticksPerSecond: 1,
			})
		).toStrictEqual(producer);
	});

	it("Serialize/deserialize with mixins", () => {
		const producer = createProducer({
			mixins: [Diminishing({ easing: Easing.Linear, ticksToZero: 10 })],
			speed: 1,
			ticksPerSecond: 1,
		});
	});
});
