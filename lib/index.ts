
export { StateMachine } from './stateMachine'
export {
    HttpError,
    BleError,
    HttpErrorCode,
    BleErrorCode,
} from './errors'
export {
    uint32ToByteArray,
    sleep,
    withTimeoutRace,
    doISeriouslyHaveToUseSubtleCrypto,
    getFuture,
    getFutureEpoch,
    sanitizePublicKey,
    parseSecretCode,
    parsePostCubeName,
    resolveVersionFromAvailableServices,
    resolveVersionFromAdvertisingData,
    templater,
} from './helpers'
export { PostCubeLogger } from './logger'


// Encoding

export {
    CommandType,
    EncodingEncryptionStrategy,
    splitCommandV1,
    parseResultV1,
    createCommandV1,
    encodeCommandV2,
    encodeResultV2,
    chunkBufferV2,
    parseBufferChunkV2,
    decodeChunkedResultV2,
    decodeChunkedPacketV2,
} from './encoding'
export type {
    CommandMap,
    Command,
    EncodingOptions,
} from './encoding'
export {
    generateCommandId,
} from './encoding/command'
export {
    generateKeyPairV2,
    cipherV1,
    decipherV1,
    cipherV2,
    decipherV2,
    deriveEncryptionKeyV1,
    deriveEncryptionKeyV2,
    encryptV1,
    decryptV1,
    encryptV2,
    decryptV2,
} from './encoding/encryption'
export type { EncryptionKeys } from './encoding/encryption'
export {
    hashSHA256,
    hashSharedSecret,
} from './encoding/hash'


// BLE API

export {
    PostCubeBLE,
    PostCube,
    Platform,
    requestPostCubeMock,
    scanForPostCubesMock,
    postCubeMockConfig,
    localStorageKeys,
    inMemoryKeys,
} from './apiBLE'
export type {
    ScanOptions,
    ScanResult,
    PostCubeMockConfig,
    MockDeviceConfig,
    KeyPair,
    Keys,
} from './apiBLE'


// React API

export {
    usePostCubeBLE,
    usePostCube,
} from './react'


// Constants

export {
    SenderValidationSchema,
    RecipientValidationSchema,
    DeliveryPointSchema,
    CreateSchema,
    TransitionValidationSchema,
} from './constants/scheme'
export {
    TRANSPORT_PROVIDER_TYPES,
} from './constants/transportProvider'
export {
    APP_TYPE,
} from './constants/organisation'
export {
    DELIVERY_POINT_TYPES,
    DELIVERY_DIRECTION,
    DELIVERY_STATE_NAMES,
    DELIVERY_TRANSITION_NAME,
    DELIVERY_STATE_VISIBILITY,
} from './constants/delivery'
export {
    BOX_STATES,
    BOX_OPERATIONS,
    LOW_BATTERY_THRESHOLD_CENT,
    BLOCKING_DELIVERY_RECIPIENT_STATES,
    BLOCKING_DELIVERY_SENDER_STATES,
} from './constants/box'
export {
    PostCubeVersion,
    MAX_PACKET_SIZE,
    PACKET_SIZE,
    PACKET_LAST_INDEX,
    PACKET_LAST_TRUE,
    PACKET_LAST_FALSE,
    COMMAND_ID_SIZE,
    DEFAULT_TIMEOUT_SCAN,
    DEFAULT_TIMEOUT_CONNECT,
    DEFAULT_TIMEOUT_DISCONNECT,
    DEFAULT_TIMEOUT_IO,
    DEFAULT_TIMEOUT_LISTEN,
    AUTH_TAG_SIZE,
    NONCE,
    SERVICE_BATTERY_UUID,
    BOX_MAGIC,
    SERVICE_UUID_16,
    SERVICE_UUID_16_BASE_0,
    SERVICE_UUID_BASE,
    SERVICE_UUID,
    CHAR_CONTROL_UUID,
    CHAR_RESULT_UUID,
    CHAR_STATUS_UUID,
    CHAR_VERSION_UUID,
    RES_UNDEFINED,
    RES_OK,
    RES_SAVE_FAILED,
    RES_INVALID_DATA,
    RES_INVALID_HASH,
    RES_INVALID_PUB_KEY,
    RES_SHARED_KEY_FAILED,
    RES_INVALID_KEY_INDEX,
    RES_INVALID_CMD,
    RES_CMD_EXPIRED,
    RES_CMD_USED,
    RES_SHARED_SECRET_FAILED,
    RES_DECRYPT_FAIL,
    RES_TIME_SAVE_FAILED,
    RES_TIME_READ_FAILED,
    RES_SYSTEM_ERROR,
    RES_DFU_IN_PROGRESS,
    RESPONSE_MESSAGES,
    DEPRECATED_SERVICE_UUID_16,
    DEPRECATED_SERVICE_UUID_16_CORDOVA,
    DEPRECATED_SERVICE_UUID,
    DEPRECATED_CHAR_SAVE_ACC_UUID,
    DEPRECATED_CHAR_SET_KEY_UUID,
    DEPRECATED_CHAR_UNLOCK_UUID,
    DEPRECATED_CHAR_RESULT_UUID,
    DEPRECATED_CHAR_STATUS_UUID,
    DEPRECATED_CHAR_TIME_SYNC_UUID,
    DEPRECATED_CID_RESERVED,
    DEPRECATED_CID_SAVE_ACC,
    DEPRECATED_CID_SET_KEY,
    DEPRECATED_CID_UNLOCK,
    DEPRECATED_CID_RESULT,
    DEPRECATED_CID_STATUS,
    DEPRECATED_CID_TIME_SYNC,
    DEPRECATED_CHAR_RESULTS_INDEX,
} from './constants/bluetooth'
