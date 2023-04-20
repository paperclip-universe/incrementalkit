import { DiminishingProducer } from "./DiminishingProducer";
import { Producer } from "./Producer";

export type AnyProducer = Producer | DiminishingProducer;
export { DiminishingProducer, Producer as SimpleProducer };
