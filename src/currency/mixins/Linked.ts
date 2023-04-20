import { Currency } from "../Currency";

export type LinkedCurrencyExchangeRateFunction = (
	gainedLinkedCurrency: number,
	currentCurrency: number,
) => number;

export type LinkedMixin<T extends new (...args: any[]) => Currency> = {
	linkedCurrency: Currency;
	linkedCurrencyExchangeRate: LinkedCurrencyExchangeRateFunction;
} & T;

/**
 * A mixin that links a currency to another currency.
 * The exchange rate is determined by the exchangeRate function.
 *
 * @param exchangeRate The exchange rate function
 * @param linkedCurrency The currency to link to
 * @returns A mixin
 */
export function Linked<T extends new (...args: any[]) => Currency>({
	exchangeRate,
	linkedCurrency,
}: {
	exchangeRate: LinkedCurrencyExchangeRateFunction;
	linkedCurrency: Currency;
}): LinkedMixin<T> {
	// TODO - Remove ts-ignore
	// @ts-ignore
	return function (Base: T) {
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
				this.amount += this.linkedCurrencyExchangeRate(
					this.linkedCurrency.getTickValue(),
					this.amount,
				);
			}
		};
	};
}
