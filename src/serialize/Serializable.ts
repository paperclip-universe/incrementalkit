export type JSONValue = string | number | boolean | JSONObject | JSONArray;

export interface JSONObject {
	[x: string]: JSONValue;
}

export type JSONArray = Array<JSONValue>;

export interface Serializable<T> {
	serialize(): JSONObject;
	deserialize(json: JSONObject): T;
}

export interface SerializableInto<T, Into> {
	serialize(into: Into): JSONObject;
	deserialize(json: JSONObject, into: Into): T;
}
