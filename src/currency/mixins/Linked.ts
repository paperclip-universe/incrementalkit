import { Currency, Mixin } from "../Currency";

export type LinkedCurrencyExchangeRateFunction = (
	gainedLinkedCurrency: number,
	currentLinkedCurrency: number,
) => number;

/**
 * A mixin that links a currency to another currency.
 * The exchange rate is determined by the exchangeRate function.
 *
 * @param exchangeRate The exchange rate function
 * @param linkedCurrency The currency to link to
 * @returns
 */
export function Linked({
	exchangeRate,
	linkedCurrency,
}: {
	exchangeRate: LinkedCurrencyExchangeRateFunction;
	linkedCurrency: Currency;
}): Mixin {
	return function <TBase extends new (...args: any[]) => Currency>(
		Base: TBase,
	) {
		return class extends Base {
			linkedCurrency: Currency;
			linkedCurrencyExchangeRate: LinkedCurrencyExchangeRateFunction;

			constructor(...args: any[]) {
				super(...args);
				this.linkedCurrency = linkedCurrency;
				this.linkedCurrencyExchangeRate = exchangeRate;
			}

			tick() {
				super.tick();
			}
		};
	};
}
