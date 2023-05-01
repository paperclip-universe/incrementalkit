import { JSONObject } from "..";
import { LocalStorageDatastore } from "./LocalStorage";
import { DatastoreLocation } from "./base";

export class AggregateDatastore implements DatastoreLocation {
	datastores: DatastoreLocation[];

	constructor() {
		this.datastores = [new LocalStorageDatastore()];
	}

	write(data: JSONObject): void {
		this.datastores.forEach((datastore) => datastore.write(data));
	}

	read(): JSONObject | null {
		const unfilteredData = this.datastores.map((datastore) =>
			datastore.read()
		);

		// If all the data are the same, return the first item.
		if (unfilteredData.every((val) => val === unfilteredData[0]))
			return unfilteredData[0];

		let timestamps = this.datastores.sort(
			(a, b) => a.readTimestamp() - b.readTimestamp()
		);

		// If there is a definitive latest timestamp, return that
		if (timestamps[0].readTimestamp() !== timestamps[1].readTimestamp()) {
			return timestamps[0].read();
		}

		// If all timestamps are NOT the same
		if (
			!timestamps.every(
				(val) => val.readTimestamp() === timestamps[0].readTimestamp()
			)
		) {
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
		}
	}

	clear(): void {
		throw new Error("Method not implemented.");
	}
	canUse(): boolean {
		throw new Error("Method not implemented.");
	}
}
