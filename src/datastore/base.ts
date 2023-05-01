import { JSONObject } from "@/serialize";

export interface DatastoreLocation {
	write(data: JSONObject): void;
	read(): JSONObject | null;
	clear(): void;
	canUse(): boolean;
}
