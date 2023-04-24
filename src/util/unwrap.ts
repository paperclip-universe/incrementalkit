type TypeOf =
	| "undefined"
	| "object"
	| "boolean"
	| "number"
	| "string"
	| "symbol"
	| "function"
	| "bigint";

export function unwrap<T>(
	value: T | undefined,
	message: string,
	type: TypeOf,
	or?: T,
): T {
	// rome-ignore lint/suspicious/useValidTypeof: type shown
	if (typeof value !== type) throw new Error("Invalid type.");
	if (value === undefined && !or) throw new Error(message);
	if (value === undefined && or) {
		console.error(message);
		return or as T;
	}
	if (value === undefined) throw new Error("Something went wrong.");
	return value;
}
