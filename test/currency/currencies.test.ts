import { describe, expect, it } from "vitest";
import { Currency } from "../../src";

describe("Currency", () => {
	it("Currency", () => {
		let currency = new Currency({
			amount: 0,
			name: "test",
			ticksPerSecond: 1,
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
});
