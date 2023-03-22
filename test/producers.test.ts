import { describe, expect, it } from "vitest";
import { DiminishingProducer, SimpleProducer } from "../src";
import { Easing } from "../src/util/easings";

describe("Producer", () => {
	describe("DiminishingProducer", () => {
		it("DiminishingProducer", () => {
			let producer = new DiminishingProducer({
				speed: 1,
				easing: Easing.Linear,
				ticksToZero: 2,
				ticksPerSecond: 1,
			});

			// Should have the initial value
			expect(producer.getTickValue(1)).toBe(1);

			// Should diminish
			producer.update();
			expect(producer.getTickValue(1)).toBe(0.5);
			producer.update();
			expect(producer.getTickValue(1)).toBe(0);

			// Should be cleaned up
			producer.update();
			expect(producer.getTickValue(1)).toBe(0);
			expect(producer.shouldBeCleaned).toBe(true);
		});

		it("DiminishingProducer with multipliers", () => {
			let producer = new DiminishingProducer({
				speed: 1,
				multipliers: [2],
				easing: Easing.Linear,
				ticksToZero: 2,
				ticksPerSecond: 1,
			});

			// Should have the initial value
			expect(producer.getTickValue(1)).toBe(2);

			// Should diminish
			producer.update();
			expect(producer.getTickValue(1)).toBe(1);
			producer.update();
			expect(producer.getTickValue(1)).toBe(0);

			// Should be cleaned up
			producer.update();
			expect(producer.getTickValue(1)).toBe(0);
			expect(producer.shouldBeCleaned).toBe(true);
		});
	});

	describe("SimpleProducer", () => {
		it("SimpleProducer", () => {
			let producer = new SimpleProducer({
				speed: 1,
				ticksPerSecond: 1,
			});

			expect(producer.getTickValue(1)).toBe(1);
		});
	});
});
