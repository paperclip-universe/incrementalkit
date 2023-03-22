import { describe, expect, it } from "vitest";
import { Currency } from "../src";

function sleep(time: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, time));
}

it("Simple incremental game", async () => {
	let coins = new Currency({
		amount: 0,
		name: "coins",
		ticksPerSecond: 0.2,
	});

	coins.addProducer(1);
	coins.addProducer(2);
	expect(coins.amount).toBe(0);

	let loop = setTimeout(() => {
		coins.tick();
	}, 200);

	await sleep(1000);
	clearTimeout(loop);

	expect(coins.amount).toBe(3 * 5);
});
