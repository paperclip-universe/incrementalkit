import { JSONObject } from "@/serialize";

// TODO: Add more datastores

export interface DatastoreLocation {
	write(data: JSONObject): void;
	read(): JSONObject | null;
	readTimestamp(): number;
	clear(): void;
	canUse(): boolean;
}
