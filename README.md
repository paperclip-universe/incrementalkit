# IncrementalKit

Make incremental games without having to remake the wheel.

## A quick taste

```ts
const game = new Game({
	tps: 10,
}).start();

const coins = game.createCurrency([], {
	amount: 0,
	name: "coins",
});

coins.addProducer(1);
// `coins` is now going up by 1 per sec.
// However, since `tps` is 10, `coins`
// goes up by 1/10 every 1/10 seconds.
```

![Cool Graph](.github/assets/dependency-graph.svg)
