import { JSONObject } from "@/serialize";
import { DatastoreLocation } from "./base";

export class LocalStorageDatastore implements DatastoreLocation {
	write(data: JSONObject) {
		localStorage.setItem("gameData", JSON.stringify(data));
	}
	read(): JSONObject | null {
		const obj = localStorage.getItem("gameData");
		if (obj) return JSON.parse(obj);
		return null;
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
