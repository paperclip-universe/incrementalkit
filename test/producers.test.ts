import { describe, expect, it } from "vitest";
import { DiminishingProducer } from "../src";
import { Easing } from "../src/util/easings";

describe("Producers", () => {
	it("DiminishingProducer", () => {
		let producer = new DiminishingProducer({
			speed: 1,
			easing: Easing.Linear,
			ticksToZero: 2,
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
		expect(producer.diminish.shouldBeCleaned).toBe(true);
	});
});
