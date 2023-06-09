import { Currency, Game } from "../../src";
import { describe, expect, it } from "vitest";

describe("Currency", () => {
	it("Currency", () => {
		const game = new Game({
			tps: 1,
		});
		const currency = game.currency({
			amount: 0,
			name: "test",
		});

		// Should have the initial value
		expect(currency.amount).toBe(0);

		// Should add a producer
		currency.addProducer(1);
		expect(currency.producers.length).toBe(1);

		// Should tick
		currency.tick();
		expect(currency.amount).toBe(1);
		currency.tick();
		expect(currency.amount).toBe(2);
	});

	it("Currency#serialize", () => {
		const currency = new Currency({
			amount: 0,
			name: "test",
			ticksPerSecond: 1,
		});

		// Should serialize
		expect(currency.serialize()).toEqual({
			amount: 0,
			name: "test",
			producers: [],
			decimalPlaces: 1,
			ticksPerSecond: 1,
		});
	});
});
