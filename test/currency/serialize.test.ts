import { it, expect } from "vitest";
import { Currency, Producer } from "../../src";

it("currency should serialize", () => {
	const coins = new Currency({
		amount: 0,
		name: "coins",
		ticksPerSecond: 1,
		producers: [new Producer({ speed: 1, ticksPerSecond: 1 })],
	});

	coins.tick();

	const serializeData = coins.serialize();

	expect(serializeData).toMatchSnapshot();
});

it("currency should deserialize", () => {
	const serializeData = {
		amount: 1,
		decimalPlaces: 1,
		name: "coins",
		producers: [
			{
				multipliers: [],
				speed: 1,
				ticksPerSecond: 1,
			},
		],
		ticksPerSecond: 1,
	};

	const coins = new Currency({
		amount: 0,
		name: "coins",
		ticksPerSecond: 1,
	});

	coins.deserialize()
});
