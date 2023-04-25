export const Type = {
	Array: (type: string) => ({ type: "array", of: type }),
	Boolean: "boolean",
	Function: "function",
	Number: "number",
	Object: "object",
	String: "string",
	Symbol: "symbol",
	Undefined: "undefined",
	Class: <A>(ctor: { new (...args: any[]): A }) => ({
		type: "class",
		of: ctor,
	}),
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
	data: { [key: string]: any }
): boolean {
	for (const [key, value] of Object.entries(schema)) {
		if (typeof value === "string") {
			// rome-ignore lint/suspicious/useValidTypeof: use of enum ensures valid typeof comparison
			if (typeof data[key] !== value) return false;
		} else if (typeof value === "object") {
			if (value.type === "array") {
				if (!Array.isArray(data[key])) return false;
				for (const item of data[key]) {
					if (!validateSchema({ item: value.of }, { item }))
						return false;
				}
			} else if (value.type === "class") {
				if (!(data[key] instanceof value.of)) return false;
			} else {
				if (!validateSchema(value, data[key])) return false;
			}
		}
	}
	return true;
}
