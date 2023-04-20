export type Mixin<T extends Currency> = (Base: T) => T & {};
