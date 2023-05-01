import { JSONObject } from "@/serialize";
import { DatastoreLocation } from "./base";

export class LocalStorageDatastore implements DatastoreLocation {
	write(data: JSONObject) {
		localStorage.setItem("gameData", JSON.stringify(data));
		localStorage.setItem(
			"gameDataTimestamp",
			new Date().getTime().toString()
		);
	}
	read(): JSONObject | null {
		const obj = localStorage.getItem("gameData");
		if (obj) return JSON.parse(obj);
		return null;
	}
	readTimestamp(): number {
		const timestamp = localStorage.getItem("gameDataTimestamp");
		if (timestamp) return parseInt(timestamp);
		return 0;
	}
	clear() {
		localStorage.removeItem("gameData");
	}
	canUse(): boolean {
		if (localStorage) {
			return true;
		} else {
			return false;
		}
	}
}
