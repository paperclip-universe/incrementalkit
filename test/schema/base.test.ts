import { Schema, Type } from "../../src";
import { describe, expect, it } from "vitest";

const exampleSchema: Schema = {
	itemA: Type.Array(Type.String),
	itemB: Type.Boolean,
	itemC: {
		subItemA: Type.Number,
	},
};

describe("Schema", () => {
	it("should validate a schema", () => {
		expect(
			Type.validateSchema(exampleSchema, {
				itemA: ["string"],
				itemB: true,
				itemC: {
					subItemA: 1,
				},
			}),
		).toBe(true);
	});

	it("should return false if the schema is invalid", () => {
		expect(
			Type.validateSchema(exampleSchema, {
				itemA: ["string"],
				itemB: true,
				itemC: {
					subItemA: "1",
				},
			}),
		).toBe(false);
	});
});
