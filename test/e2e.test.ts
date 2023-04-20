import { describe, expect, it } from "vitest";
import { Currency } from "../src";
import { sleep } from "./utils";

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

	await sleep(1100);

	expect(coins.amount).toBe(3);
	coins.addProducer(3);

	await sleep(1100);

	expect(coins.amount).toBe(9);
});
