export interface Serializable<T> {
	serialize(): JSON;
	deserialize(json: JSON): T;
}
