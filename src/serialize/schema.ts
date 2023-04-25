export const Type = {
	Array: (type: string | SpecialType) => ({ type: "array", of: type }),
	Class: <A>(ctor: { new (...args: any[]): A }) => ({
		type: "class",
		of: ctor,
	}),
	Optional: (type: string | SpecialType) => ({ type: "optional", of: type }),
	Boolean: "boolean",
	Function: "function",
	Number: "number",
	Object: "object",
	String: "string",
	Symbol: "symbol",
	Undefined: "undefined",
	validateSchema,
};

export type SpecialType = { type: string; of: any };

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
): [boolean, string] {
	for (const [key, value] of Object.entries(schema)) {
		if (typeof value === "string") {
			// rome-ignore lint/suspicious/useValidTypeof: use of enum ensures valid typeof comparison
			if (typeof data[key] !== value)
				return [false, `Expected ${key} to be of type ${value}`];
		} else if (typeof value === "object") {
			if (value.type === "array") {
				if (!Array.isArray(data[key]))
					return [false, `Expected ${key} to be an array`];
				for (const item of data[key]) {
					if (!validateSchema({ item: value.of }, { item })[0])
						return [
							false,
							`Expected ${key} to be an array of type ${value.of}`,
						];
				}
			} else if (value.type === "class") {
				if (!(data[key] instanceof value.of))
					return [
						false,
						`Expected ${key} to be an instance of class ${value.of}`,
					];
			} else if (value.type === "optional") {
				if (
					data[key] &&
					!validateSchema({ item: value.of }, { item: data[key] })[0]
				)
					return [
						false,
						`Expected ${key} to, if present, be of type ${value.of}`,
					];
			} else {
				if (!validateSchema(value, data[key])[0]) return [false, ""];
			}
		}
	}
	return [true, ""];
}
