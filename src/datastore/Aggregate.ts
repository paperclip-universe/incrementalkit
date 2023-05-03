import { JSONObject } from "..";
import { LocalStorageDatastore } from "./LocalStorage";
import { DatastoreLocation } from "./base";

export class AggregateDatastore implements DatastoreLocation {
	datastores: DatastoreLocation[];

	constructor() {
		this.datastores = [new LocalStorageDatastore()];
	}

	readTimestamp(): number {
		return this.datastores
			.sort((a, b) => a.readTimestamp() - b.readTimestamp())
			.filter((x) => x.read() !== null)[0]
			.readTimestamp();
	}

	write(data: JSONObject): void {
		this.datastores.forEach((datastore) => datastore.write(data));
	}

	/**
	 * Reads from an aggregate save-game datastore.
	 *
	 * The method it uses to find the latest savegame is as follows:
	 * - If every savegame is the same, return that
	 * - If there is a definitive latest savegame, return that
	 * - Filter out all savegames that aren't the most recent
	 * - Repeat step 1
	 * - Return the largest savegame TODO: to change
	 *
	 * @returns The best savegame
	 * @modifies Writes data to the other datastores
	 */
	read(): JSONObject | null {
		// TODO: Add content-based sorting and multiple-timestamp storage-checking
		// TODO: Make more generic and able to be used for non-savegame purposes

		// TODO: Clean up a bit
		const initData = this.datastores
			.map((datastore) => datastore.read())
			.filter((x) => x !== null);

		// If all the data are the same, return the first item.
		if (initData.every((val) => val === initData[0])) {
			// @ts-ignore TODO: Remove during refactor
			this.write(initData[0]);
			return initData[0];
		}

		let timestamps = this.datastores
			.sort((a, b) => a.readTimestamp() - b.readTimestamp())
			.filter((x) => x.read() !== null);

		// If there is a definitive latest timestamp, return that
		if (timestamps[0].readTimestamp() !== timestamps[1].readTimestamp()) {
			// @ts-ignore TODO: Remove during refactor
			this.write(timestamps[0].read());
			return timestamps[0].read();
		}

		// If all timestamps are NOT the same
		if (
			!timestamps.every(
				(val) => val.readTimestamp() === timestamps[0].readTimestamp()
			)
		) {
			// Only use the ones with the latest timestampss
			timestamps = timestamps.filter(
				(x) => x.readTimestamp() === timestamps[0].readTimestamp()
			);
		}

		const frequencies: Record<string, number> = {};

		const mostCommon = timestamps.reduce((acc, obj) => {
			const key = JSON.stringify(obj); // convert object to string for comparison

			if (!obj) {
				return acc;
			}

			frequencies[key] = (frequencies[key] || 0) + 1;

			if (frequencies[key] > frequencies[JSON.stringify(acc)]) {
				return obj;
			}

			return acc;
		}, {});

		if (mostCommon) {
			this.write(mostCommon);
			return mostCommon;
		} else {
			// Uh oh. Here's what happened:
			// - All sources of data are different
			// - There is no definative latest savegame
			// - The savegames that have the latest timestamp are all different*
			// Here's how we figure out what savegame to choose:
			// TODO: We choose the largest savegame. Could be better, but until everything is a bit more tethered together I needed a quick and dirty solution.
			const serializedGameData = timestamps.map((x) =>
				JSON.stringify(x.read())
			);

			const largestSaveGame = JSON.parse(
				serializedGameData.reduce((a, b) =>
					a.length > b.length ? a : b
				)
			);

			this.write(largestSaveGame);
			return largestSaveGame;

			// *🤓 techhkicanlly, it's 🤓 ackthually all of the savegames have the same distribution
		}
	}

	clear(): void {
		throw new Error("Method not implemented.");
	}
	canUse(): boolean {
		throw new Error("Method not implemented.");
	}
}
