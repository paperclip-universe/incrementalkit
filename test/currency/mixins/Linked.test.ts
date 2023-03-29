import { expect, it } from "vitest";
import { createCurrency, Linked } from "../../../src";
import { sleep } from "../../utils";

it("Mixins#linked", () => {
	let coins = createCurrency([], {
		amount: 0,
		name: "coins",
		ticksPerSecond: 1,
	});
	let prestigePoints = createCurrency(
		[Linked({ exchangeRate: (x, _) => x, linkedCurrency: coins })],
		{
			amount: 0,
			name: "coins",
			ticksPerSecond: 1,
		}
	);
	coins.addProducer(1);
	coins.tick();
	prestigePoints.tick();
	expect(prestigePoints.amount).toBeGreaterThan(0.1);
});
