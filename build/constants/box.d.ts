import { STATE_NAMES as DELIVERY_STATES } from './delivery';
export declare enum BOX_STATES {
    IDLE = "IDLE",
    OFFLINE = "OFFLINE",
    BLOCKED_BY_DELIVERY = "BLOCKED_BY_DELIVERY",
    OUT_OF_PARTITIONS = "OUT_OF_PARTITIONS"
}
export declare enum BOX_OPERATIONS {
    BLOCK_FOR_DELIVERY = "BLOCK_FOR_DELIVERY"
}
export declare const LOW_BATTERY_THRESHOLD_CENT = 5;
export declare const BLOCKING_DELIVERY_RECIPIENT_STATES: DELIVERY_STATES[];
export declare const BLOCKING_DELIVERY_SENDER_STATES: DELIVERY_STATES[];
