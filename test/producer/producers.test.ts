import { describe, expect, it } from "vitest";
import { createProducer } from "../../src";

describe("SimpleProducer", () => {
	it("SimpleProducer", () => {
		const producer = createProducer([], {
			speed: 1,
			ticksPerSecond: 1,
		});

		expect(producer.getTickValue(1)).toBe(1);
	});
});
