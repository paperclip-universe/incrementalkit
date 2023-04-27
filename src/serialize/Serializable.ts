export type JSONValue = string | number | boolean | JSONObject | JSONArray;

export interface JSONObject {
	[x: string]: JSONValue;
}

export type JSONArray = Array<JSONValue>;

// TODO: Clean up this mess
export interface Serializable<T> {
	serialize(): JSONObject;
	// deserialize(json: JSONObject): T;
}

export interface SerializableJSON<T> {
	serialize(): JSON;
	deserialize(json: JSON): T;
}
