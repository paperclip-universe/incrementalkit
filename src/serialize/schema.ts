import { JSONObject } from "./Serializable";

export const Type = {
	Array: (type: string) => ({ type: "array", of: type }),
	Boolean: "boolean",
	Function: "function",
	Number: "number",
	Object: "object",
	String: "string",
	Symbol: "symbol",
	Undefined: "undefined",
};

export type SpecialType = { type: string; of: string };

export type Schema = {
	[key: string]: Schema | SpecialType | string;
};

// const exampleSchema: Schema = {
// 	itemA: Type.Array(Type.String),
// 	itemB: Type.Boolean,
// 	itemC: {
// 		subItemA: Type.Number,
// 	},
// };

export function validateSchema(
	schema: Schema,
	data: { [key: string]: any },
): boolean {
	for (const [key, value] of Object.entries(schema)) {
		if (typeof value === "string") {
			switch (value) {
				case Type.Boolean:
					if (typeof data[key] !== "boolean") return false;
					break;
				case Type.Function:
					if (typeof data[key] !== "function") return false;
					break;
				case Type.Number:
					if (typeof data[key] !== "number") return false;
					break;
				case Type.Object:
					if (typeof data[key] !== "object") return false;
					break;
				case Type.String:
					if (typeof data[key] !== "string") return false;
					break;
				case Type.Symbol:
					if (typeof data[key] !== "symbol") return false;
					break;
				case Type.Undefined:
					if (typeof data[key] !== "undefined") return false;
					break;
			}
		} else if (typeof value === "object") {
			if (value.type === "array") {
				if (!Array.isArray(data[key])) return false;
				for (const item of data[key]) {
					if (!validateSchema({ item: value.of }, { item })) return false;
				}
			} else {
				if (!validateSchema(value, data[key])) return false;
			}
		}
	}
	return true;
}
