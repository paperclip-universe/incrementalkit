import { LocalStorageDatastore } from "../../src/datastore/LocalStorage";
import { AggregateDatastore } from "../../src/datastore/Aggregate";
import { beforeEach, expect, test } from "vitest";
import "localstorage-polyfill";

const datastores = [AggregateDatastore, LocalStorageDatastore];

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
