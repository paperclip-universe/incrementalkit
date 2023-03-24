import { Currency, Mixin } from "../Currency";

export type LinkedExchangeRateFunction = (
	extraLinkedCurrency: number,
	currentCurrency: number
) => number;


export function Linked({
	linkedCurrency,
	exchangeRate = (x, _) => x,
}: {
	linkedCurrency: Currency;
	exchangeRate?: LinkedExchangeRateFunction;
}): Mixin {
	return function (currency: Currency): Currency {
		currency.
	}
}
