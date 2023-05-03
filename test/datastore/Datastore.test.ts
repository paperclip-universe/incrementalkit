import { LocalStorageDatastore } from "../../src/datastore/LocalStorage";
import { AggregateDatastore } from "../../src/datastore/Aggregate";
import { beforeEach, expect, test } from "vitest";
import { LocalStorage } from "node-localstorage";

const datastores = [AggregateDatastore, LocalStorageDatastore];

beforeEach(() => {
	global.localStorage = new LocalStorage("./scratch");
});

test.each(datastores)("%s datastore sanity check", (datastore) => {
	const store = new datastore();

	const startTimestamp = new Date().getTime();
	store.write({
		foo: "bar",
	});

	expect(store.read()).toStrictEqual({
		foo: "bar",
	});

	expect(store.readTimestamp()).toBeCloseTo(startTimestamp, -2);
});
