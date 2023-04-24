import { Diminishing, createProducer } from "../../../src";
import { Easing } from "../../../src/util/easings";
import { expect, it } from "vitest";

it("Mixins#linked", () => {
	const coins = createProducer(
		[Diminishing({ easing: Easing.Linear, ticksToZero: 2 })],
		{
			speed: 1,
			multipliers: [],
			ticksPerSecond: 1,
		},
	);

	expect(coins.getTickValue()).toBe(1);
	coins.update();
	expect(coins.getTickValue()).toBe(0.5);
	coins.update();
	expect(coins.getTickValue()).toBe(0);
});
