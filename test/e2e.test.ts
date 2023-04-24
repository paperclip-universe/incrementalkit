import { Currency } from "../src";
import { sleep } from "./utils";
import { describe, expect, it } from "vitest";

it("Simple incremental game", async () => {
	const coins = new Currency({
		amount: 0,
		name: "coins",
		ticksPerSecond: 5,
	});

	coins.addProducer(1);
	coins.addProducer(2);
	expect(coins.amount).toBe(0);

	coins.start();

	await sleep(1100);

	expect(coins.amount).toBe(3);
	coins.addProducer(3);

	await sleep(1100);

	expect(coins.amount).toBe(9);
});
