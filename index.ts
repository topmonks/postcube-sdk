
export { StateMachine } from './lib/stateMachine'
export {
    HttpError,
    BleError,
    HttpErrorCode,
    BleErrorCode,
} from './lib/errors'
export {
    getFuture,
    getFutureEpoch,
    parseSecretCode,
    parseBoxName,
} from './lib/helpers'


// Boxes API

export {
    PostCubeBLE,
    PostCube,
    Platform,
} from './lib/apiBLE'
export type {
    ScanOptions,
    ScanResult,
} from './lib/apiBLE'


// React API

export { usePostCubeBLE, usePostCube } from './lib/react'


// Constants

export {
    SenderValidationSchema,
    RecipientValidationSchema,
    DeliveryPointSchema,
    CreateSchema,
    TransitionValidationSchema,
} from './lib/constants/scheme'
export {
    TRANSPORT_PROVIDER_TYPES,
} from './lib/constants/transportProvider'
export {
    APP_TYPE,
} from './lib/constants/organisation'
export {
    POINT_TYPES,
    DIRECTION,
    STATE_NAMES,
    TRANSITION_NAME,
    STATE_VISIBILITY,
} from './lib/constants/delivery'
export {
    BOX_STATES,
    BOX_OPERATIONS,
    LOW_BATTERY_THRESHOLD_CENT,
    BLOCKING_DELIVERY_RECIPIENT_STATES,
    BLOCKING_DELIVERY_SENDER_STATES,
} from './lib/constants/box'
export {
    PACKET_SIZE,
    DEFAULT_TIMEOUT_CONNECT,
    DEFAULT_TIMEOUT_DISCONNECT,
    SERVICE_BATTERY_UUID,
    SERVICE_UUID_16,
    SERVICE_UUID,
    CHAR_BATTERY_LEVEL_UUID,
    CHAR_VERSION_UUID,
    CHAR_STATUS_UUID,
    CHAR_CONTROL_UUID,
    CHAR_RESULT_UUID,
    BOX_RES_UNDEFINED,
    BOX_RES_OK,
    BOX_RES_SAVE_FAILED,
    BOX_RES_INVALID_DATA,
    BOX_RES_INVALID_HASH,
    BOX_RES_INVALID_PUB_KEY,
    BOX_RES_SHARED_KEY_FAILED,
    BOX_RES_INVALID_KEY_INDEX,
    BOX_RES_INVALID_CMD,
    BOX_RES_CMD_EXPIRED,
    BOX_RES_CMD_USED,
    BOX_RES_SHARED_SECRET_FAILED,
    BOX_RES_DECRYPT_FAIL,
    BOX_RES_TIME_SAVE_FAILED,
    BOX_RES_TIME_READ_FAILED,
    BOX_RES_SYSTEM_ERROR,
    BOX_RES_DFU_IN_PROGRESS,
    BOX_RESPONSE_MESSAGES,
} from './lib/constants/bluetooth'
