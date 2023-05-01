import { JSONObject } from "@/serialize";

export interface DatastoreLocation {
	write(data: JSONObject): void;
	read(): JSONObject | null;
	readTimestamp(): number;
	clear(): void;
	canUse(): boolean;
}
