import { Schema, Type } from "../../src";
import { describe, expect, it } from "vitest";

class Test {
	fooA: number;

	constructor(fooA: number) {
		this.fooA = fooA;
	}
}

class Tost {
	constructor() {}
}

const exampleSchema: Schema = {
	itemA: Type.Array(Type.String),
	itemB: Type.Boolean,
	itemC: {
		subItemA: Type.Number,
	},
	classA: Type.Class(Test),
	optionalA: Type.Optional(Type.Number),
	optionalB: Type.Optional(Type.Number),
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
				classA: new Test(1),
				optionalB: 1,
			}),
		).toStrictEqual([true, ""]);
	});

	it("should return false if the schema is invalid", () => {
		expect(
			Type.validateSchema(exampleSchema, {
				itemA: ["string"],
				itemB: true,
				itemC: {
					subItemA: "1",
				},
				classA: new Tost(),
				optionalA: "test",
			})[0],
		).toBe(false);
	});
});
