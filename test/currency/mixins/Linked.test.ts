import { Linked, createCurrency } from "../../../src";
import { sleep } from "../../utils";
import { expect, it } from "vitest";

it("Mixins#linked", () => {
	const coins = createCurrency({
		amount: 0,
		name: "coins",
		ticksPerSecond: 1,
	});
	const prestigePoints = createCurrency({
		amount: 0,
		name: "prestigePoints",
		ticksPerSecond: 1,
		mixins: [
			Linked({ exchangeRate: (x, _) => x / 10, linkedCurrency: coins }),
		],
	});
	coins.addProducer(1);
	coins.tick();
	prestigePoints.tick();
	expect(prestigePoints.amount).toBe(0.1);
});
