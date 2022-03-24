
export const PACKET_SIZE                = 20
export const PACKET_LAST_INDEX          = 0x0
export const PACKET_LAST_TRUE           = 0x1
export const PACKET_LAST_FALSE          = 0x0
export const COMMAND_ID_SIZE            = 4 // bytes = 32bit uint
export const DEFAULT_TIMEOUT_CONNECT    = 7000
export const DEFAULT_TIMEOUT_DISCONNECT = 3000
export const DEFAULT_TIMEOUT_IO         = 4000
export const DEFAULT_TIMEOUT_LISTEN     = 10000
export const AUTH_TAG_SIZE              = 16
export const NONCE                      = new Uint8Array(12)

export const SERVICE_BATTERY_UUID    = '0000180f-0000-1000-8000-00805f9b34fb'
export const CHAR_BATTERY_LEVEL_UUID = '00002a19-0000-1000-8000-00805f9b34fb'

export const BOX_MAGIC         = 0x0b0e0e0f
export const SERVICE_UUID_16   = 0x8000
export const SERVICE_UUID_BASE = [
    0xb6, 0xc0, 0xb8, 0xc2, 0xa6, 0x77, 0xe8, 0x87,
    0xde, 0x45, 0xe0, 0xed, 0x00, 0x00, 0x66, 0x13,
]

export const SERVICE_UUID      = '13668000-ede0-45de-87e8-77a6c2b8c0b6'
export const CHAR_CONTROL_UUID = '13668001-ede0-45de-87e8-77a6c2b8c0b6'
export const CHAR_RESULT_UUID  = '13668002-ede0-45de-87e8-77a6c2b8c0b6'
export const CHAR_STATUS_UUID  = '13668003-ede0-45de-87e8-77a6c2b8c0b6'
export const CHAR_VERSION_UUID = '13668004-ede0-45de-87e8-77a6c2b8c0b6'

// ../firmware/nrf_firmware/box_results.h
export const RES_UNDEFINED            = 0
export const RES_OK                   = RES_UNDEFINED + 1
export const RES_SAVE_FAILED          = RES_UNDEFINED + 2
export const RES_INVALID_DATA         = RES_UNDEFINED + 3
export const RES_INVALID_HASH         = RES_UNDEFINED + 4
export const RES_INVALID_PUB_KEY      = RES_UNDEFINED + 5
export const RES_SHARED_KEY_FAILED    = RES_UNDEFINED + 6
export const RES_INVALID_KEY_INDEX    = RES_UNDEFINED + 7
export const RES_INVALID_CMD          = RES_UNDEFINED + 8
export const RES_CMD_EXPIRED          = RES_UNDEFINED + 9
export const RES_CMD_USED             = RES_UNDEFINED + 10
export const RES_SHARED_SECRET_FAILED = RES_UNDEFINED + 11
export const RES_DECRYPT_FAIL         = RES_UNDEFINED + 12
export const RES_TIME_SAVE_FAILED     = RES_UNDEFINED + 13
export const RES_TIME_READ_FAILED     = RES_UNDEFINED + 14
export const RES_SYSTEM_ERROR         = RES_UNDEFINED + 15
export const RES_DFU_IN_PROGRESS      = RES_UNDEFINED + 16

export const RESPONSE_MESSAGES = {
    [RES_UNDEFINED]:            'Neznámá odpověď boxu',
    [RES_OK]:                   'OK',
    [RES_SAVE_FAILED]:          'SAVE_FAILED',
    [RES_INVALID_DATA]:         'INVALID_DATA',
    [RES_INVALID_HASH]:         'Nesprávný kód',
    [RES_INVALID_PUB_KEY]:      'INVALID_PUB_KEY',
    [RES_SHARED_KEY_FAILED]:    'SHARED_KEY_FAILED',
    [RES_INVALID_KEY_INDEX]:    'INVALID_KEY_INDEX',
    [RES_INVALID_CMD]:          'INVALID_CMD',
    [RES_CMD_EXPIRED]:          'CMD_EXPIRED',
    [RES_CMD_USED]:             'CMD_USED',
    [RES_SHARED_SECRET_FAILED]: 'SHARED_SECRET_FAILED',
    [RES_DECRYPT_FAIL]:         'DECRYPT_FAIL',
    [RES_TIME_SAVE_FAILED]:     'TIME_SAVE_FAILED',
    [RES_TIME_READ_FAILED]:     'TIME_READ_FAILED',
    [RES_SYSTEM_ERROR]:         'SYSTEM_ERROR',
}

// Deprecated... go AWAY!!

export const DEPRECATED_SERVICE_UUID_16         = 0x7900
export const DEPRECATED_SERVICE_UUID_16_CORDOVA = '00007900-0000-1000-8000-00805F9B34FB'
export const DEPRECATED_SERVICE_UUID            = '13667900-ede0-45de-87e8-77a6c2b8c0b6'
export const DEPRECATED_CHAR_SAVE_ACC_UUID      = '13667901-ede0-45de-87e8-77a6c2b8c0b6'
export const DEPRECATED_CHAR_SET_KEY_UUID       = '13667902-ede0-45de-87e8-77a6c2b8c0b6'
export const DEPRECATED_CHAR_UNLOCK_UUID        = '13667903-ede0-45de-87e8-77a6c2b8c0b6'
export const DEPRECATED_CHAR_RESULT_UUID        = '13667904-ede0-45de-87e8-77a6c2b8c0b6'
export const DEPRECATED_CHAR_STATUS_UUID        = '13667905-ede0-45de-87e8-77a6c2b8c0b6'
export const DEPRECATED_CHAR_TIME_SYNC_UUID     = '13667906-ede0-45de-87e8-77a6c2b8c0b6'

export const DEPRECATED_CID_RESERVED  = 0
export const DEPRECATED_CID_SAVE_ACC  = 1
export const DEPRECATED_CID_SET_KEY   = 2
export const DEPRECATED_CID_UNLOCK    = 3
export const DEPRECATED_CID_RESULT    = 4
export const DEPRECATED_CID_STATUS    = 5
export const DEPRECATED_CID_TIME_SYNC = 6

export const DEPRECATED_CHAR_RESULTS_INDEX = {
    [DEPRECATED_CHAR_SAVE_ACC_UUID]:  DEPRECATED_CID_SAVE_ACC,
    [DEPRECATED_CHAR_SET_KEY_UUID]:   DEPRECATED_CID_SET_KEY,
    [DEPRECATED_CHAR_UNLOCK_UUID]:    DEPRECATED_CID_UNLOCK,
    [DEPRECATED_CHAR_RESULT_UUID]:    DEPRECATED_CID_RESULT,
    [DEPRECATED_CHAR_STATUS_UUID]:    DEPRECATED_CID_STATUS,
    [DEPRECATED_CHAR_TIME_SYNC_UUID]: DEPRECATED_CID_TIME_SYNC,
}
