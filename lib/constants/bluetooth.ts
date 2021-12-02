
export const PACKET_SIZE                = 20
export const DEFAULT_TIMEOUT_CONNECT    = 7000
export const DEFAULT_TIMEOUT_DISCONNECT = 3000

export const SERVICE_BATTERY_UUID    = '0000180f-0000-1000-8000-00805f9b34fb'
export const CHAR_BATTERY_LEVEL_UUID = '00002a19-0000-1000-8000-00805f9b34fb'

export const SERVICE_UUID_16   = 0x8000
export const SERVICE_UUID      = '13668000-ede0-45de-87e8-77a6c2b8c0b6'
export const CHAR_CONTROL_UUID = '13668001-ede0-45de-87e8-77a6c2b8c0b6'
export const CHAR_RESULT_UUID  = '13668002-ede0-45de-87e8-77a6c2b8c0b6'
export const CHAR_STATUS_UUID  = '13668003-ede0-45de-87e8-77a6c2b8c0b6'
export const CHAR_VERSION_UUID = '13668004-ede0-45de-87e8-77a6c2b8c0b6'

// ../firmware/nrf_firmware/box_results.h
export const BOX_RES_UNDEFINED            = 0
export const BOX_RES_OK                   = BOX_RES_UNDEFINED + 1
export const BOX_RES_SAVE_FAILED          = BOX_RES_UNDEFINED + 2
export const BOX_RES_INVALID_DATA         = BOX_RES_UNDEFINED + 3
export const BOX_RES_INVALID_HASH         = BOX_RES_UNDEFINED + 4
export const BOX_RES_INVALID_PUB_KEY      = BOX_RES_UNDEFINED + 5
export const BOX_RES_SHARED_KEY_FAILED    = BOX_RES_UNDEFINED + 6
export const BOX_RES_INVALID_KEY_INDEX    = BOX_RES_UNDEFINED + 7
export const BOX_RES_INVALID_CMD          = BOX_RES_UNDEFINED + 8
export const BOX_RES_CMD_EXPIRED          = BOX_RES_UNDEFINED + 9
export const BOX_RES_CMD_USED             = BOX_RES_UNDEFINED + 10
export const BOX_RES_SHARED_SECRET_FAILED = BOX_RES_UNDEFINED + 11
export const BOX_RES_DECRYPT_FAIL         = BOX_RES_UNDEFINED + 12
export const BOX_RES_TIME_SAVE_FAILED     = BOX_RES_UNDEFINED + 13
export const BOX_RES_TIME_READ_FAILED     = BOX_RES_UNDEFINED + 14
export const BOX_RES_SYSTEM_ERROR         = BOX_RES_UNDEFINED + 15
export const BOX_RES_DFU_IN_PROGRESS      = BOX_RES_UNDEFINED + 16

export const BOX_RESPONSE_MESSAGES = {
    [BOX_RES_UNDEFINED]:            'Neznámá odpověď boxu',
    [BOX_RES_OK]:                   'OK',
    [BOX_RES_SAVE_FAILED]:          'SAVE_FAILED',
    [BOX_RES_INVALID_DATA]:         'INVALID_DATA',
    [BOX_RES_INVALID_HASH]:         'Nesprávný kód',
    [BOX_RES_INVALID_PUB_KEY]:      'INVALID_PUB_KEY',
    [BOX_RES_SHARED_KEY_FAILED]:    'SHARED_KEY_FAILED',
    [BOX_RES_INVALID_KEY_INDEX]:    'INVALID_KEY_INDEX',
    [BOX_RES_INVALID_CMD]:          'INVALID_CMD',
    [BOX_RES_CMD_EXPIRED]:          'CMD_EXPIRED',
    [BOX_RES_CMD_USED]:             'CMD_USED',
    [BOX_RES_SHARED_SECRET_FAILED]: 'SHARED_SECRET_FAILED',
    [BOX_RES_DECRYPT_FAIL]:         'DECRYPT_FAIL',
    [BOX_RES_TIME_SAVE_FAILED]:     'TIME_SAVE_FAILED',
    [BOX_RES_TIME_READ_FAILED]:     'TIME_READ_FAILED',
    [BOX_RES_SYSTEM_ERROR]:         'SYSTEM_ERROR',
}
