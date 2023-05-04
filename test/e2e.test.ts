import { Currency, Game } from "../src";
import { sleep } from "./utils";
import { describe, expect, it } from "vitest";

it("Simple incremental game", async () => {
	const game = new Game({ tps: 5 });
	const coins = game.currency("coins");

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
