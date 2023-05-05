import { z } from "zod";
import { Easing, getEasing } from "../../util/easings";
import { Producer } from "../Producer";

export type DiminishingMixin<T extends new (...args: any[]) => Producer> =
	{} & T;

export const DiminishingMixinDataSchema = z.object({
	ticksToZero: z.number().positive(),
});

/**
 * A mixin that links a currency to another currency.
 * The exchange rate is determined by the exchangeRate function.
 *
 * @param exchangeRate The exchange rate function
 * @param linkedCurrency The currency to link to
 * @returns A mixin
 */
export function Diminishing<
	T extends new (...args: any[]) => Producer
>(params: { easing: Easing; ticksToZero: number }): DiminishingMixin<T> {
	// TODO - Remove ts-ignore
	// @ts-ignore
	return function (Base: T) {
		return class extends Base {
			easing: Easing;
			ticksToZero: number;
			ticksToZeroOriginal: number = 0;

			constructor(...args: any[]) {
				super(...args);
				this.easing = params.easing;
				this.ticksToZero = params.ticksToZero;
				this.ticksToZeroOriginal = params.ticksToZero;
			}

			update() {
				super.update();
				this.ticksToZero--;
			}

			getTickValue(ticksPerSecond?: number): number {
				// TODO - automatically clean up
				if (this.shouldBeCleaned) return 0;
				return (
					super.getTickValue(ticksPerSecond) *
					getEasing(this.easing)(
						this.ticksToZero / this.ticksToZeroOriginal
					)
				);
			}
		};
	};
}
