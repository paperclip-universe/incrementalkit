import { describe, expect, it } from "vitest";
import { Currency } from "../src";

function sleep(time: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, time));
}

it("Simple incremental game", async () => {
	let coins = new Currency({
		amount: 0,
		name: "coins",
		ticksPerSecond: 5,
	});

	coins.addProducer(1);
	coins.addProducer(2);
	expect(coins.amount).toBe(0);

	let loop = setInterval(() => {
		coins.tick();
	}, 200);

	await sleep(1001);

	expect(coins.amount).toBe(3);
	coins.addProducer(3);

	await sleep(1000);

	expect(coins.amount).toBe(3 * 10 + 3 * 5);
});
