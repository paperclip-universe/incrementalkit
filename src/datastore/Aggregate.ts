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

		// Remove all null items
		const data: JSONObject[] = unfilteredData.filter(
			(item): item is JSONObject => item !== null
		);

		const frequencies: Record<string, number> = {};

		const mostCommon = data.reduce((acc, obj) => {
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
	}

	clear(): void {
		throw new Error("Method not implemented.");
	}
	canUse(): boolean {
		throw new Error("Method not implemented.");
	}
}
