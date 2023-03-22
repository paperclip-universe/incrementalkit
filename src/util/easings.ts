export function easeOutSine(x: number): number {
	return Math.sin((x * Math.PI) / 2);
}

export function easeOutCubic(x: number): number {
	return 1 - Math.pow(1 - x, 3);
}
