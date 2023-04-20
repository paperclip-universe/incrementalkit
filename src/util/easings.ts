export function easeOutSine(x: number): number {
	return Math.sin((x * Math.PI) / 2);
}

export function easeOutCubic(x: number): number {
	return 1 - Math.pow(1 - x, 3);
}

export function linear(x: number): number {
	return x;
}

export enum Easing {
	EaseOutSine = 0,
	EaseOutCubic = 1,
	Linear = 2,
}

export function getEasing(easing: Easing) {
	switch (easing) {
		case Easing.EaseOutSine:
			return easeOutSine;
		case Easing.EaseOutCubic:
			return easeOutCubic;
		case Easing.Linear:
			return linear;
	}
}
