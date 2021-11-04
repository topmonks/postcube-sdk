const SERVICE_UUID_16 = 0x7900;
const SERVICE_UUID_16_CORDOVA = "00007900-0000-1000-8000-00805F9B34FB";
const SERVICE_UUID = "13667900-ede0-45de-87e8-77a6c2b8c0b6";
const CHAR_SAVE_ACC_UUID = "13667901-ede0-45de-87e8-77a6c2b8c0b6";
const CHAR_SET_KEY_UUID = "13667902-ede0-45de-87e8-77a6c2b8c0b6";
const CHAR_UNLOCK_UUID = "13667903-ede0-45de-87e8-77a6c2b8c0b6";
const CHAR_RESULT_UUID = "13667904-ede0-45de-87e8-77a6c2b8c0b6";
const CHAR_STATUS_UUID = "13667905-ede0-45de-87e8-77a6c2b8c0b6";
const CHAR_TIME_SYNC_UUID = "13667906-ede0-45de-87e8-77a6c2b8c0b6";

const BOX_CID_RESERVED = 0;
const BOX_CID_SAVE_ACC = 1;
const BOX_CID_SET_KEY = 2;
const BOX_CID_UNLOCK = 3;
const BOX_CID_RESULT = 4;
const BOX_CID_STATUS = 5;
const BOX_CID_TIME_SYNC = 6;

// ../firmware/nrf_firmware/box_results.h
const BOX_RES_UNDEFINED = 0;
const BOX_RES_OK = BOX_RES_UNDEFINED + 1;
const BOX_RES_SAVE_FAILED = BOX_RES_UNDEFINED + 2;
const BOX_RES_INVALID_DATA = BOX_RES_UNDEFINED + 3;
const BOX_RES_INVALID_HASH = BOX_RES_UNDEFINED + 4;
const BOX_RES_INVALID_PUB_KEY = BOX_RES_UNDEFINED + 5;
const BOX_RES_SHARED_KEY_FAILED = BOX_RES_UNDEFINED + 6;
const BOX_RES_INVALID_KEY_INDEX = BOX_RES_UNDEFINED + 7;
const BOX_RES_INVALID_CMD = BOX_RES_UNDEFINED + 8;
const BOX_RES_CMD_EXPIRED = BOX_RES_UNDEFINED + 9;
const BOX_RES_CMD_USED = BOX_RES_UNDEFINED + 10;
const BOX_RES_SHARED_SECRET_FAILED = BOX_RES_UNDEFINED + 11;
const BOX_RES_DECRYPT_FAIL = BOX_RES_UNDEFINED + 12;
const BOX_RES_TIME_SAVE_FAILED = BOX_RES_UNDEFINED + 13;
const BOX_RES_TIME_READ_FAILED = BOX_RES_UNDEFINED + 14;
const BOX_RES_SYSTEM_ERROR = BOX_RES_UNDEFINED + 15;
const BOX_RES_DFU_IN_PROGRESS = BOX_RES_UNDEFINED + 16;

const BOX_CHAR_RESULTS_INDEX = {
  [CHAR_SAVE_ACC_UUID]: BOX_CID_SAVE_ACC,
  [CHAR_SET_KEY_UUID]: BOX_CID_SET_KEY,
  [CHAR_UNLOCK_UUID]: BOX_CID_UNLOCK,
  [CHAR_RESULT_UUID]: BOX_CID_RESULT,
  [CHAR_STATUS_UUID]: BOX_CID_STATUS,
  [CHAR_TIME_SYNC_UUID]: BOX_CID_TIME_SYNC,
};

const BOX_RESPONSE_MESSAGES = {
  [BOX_RES_UNDEFINED]: "Neznámá odpověď boxu",
  [BOX_RES_OK]: "OK",
  [BOX_RES_SAVE_FAILED]: "SAVE_FAILED",
  [BOX_RES_INVALID_DATA]: "INVALID_DATA",
  [BOX_RES_INVALID_HASH]: "Nesprávný kód",
  [BOX_RES_INVALID_PUB_KEY]: "INVALID_PUB_KEY",
  [BOX_RES_SHARED_KEY_FAILED]: "SHARED_KEY_FAILED",
  [BOX_RES_INVALID_KEY_INDEX]: "INVALID_KEY_INDEX",
  [BOX_RES_INVALID_CMD]: "INVALID_CMD",
  [BOX_RES_CMD_EXPIRED]: "CMD_EXPIRED",
  [BOX_RES_CMD_USED]: "CMD_USED",
  [BOX_RES_SHARED_SECRET_FAILED]: "SHARED_SECRET_FAILED",
  [BOX_RES_DECRYPT_FAIL]: "DECRYPT_FAIL",
  [BOX_RES_TIME_SAVE_FAILED]: "TIME_SAVE_FAILED",
  [BOX_RES_TIME_READ_FAILED]: "TIME_READ_FAILED",
  [BOX_RES_SYSTEM_ERROR]: "SYSTEM_ERROR",
};

var bleBox = {
  SERVICE_UUID_16,
  SERVICE_UUID_16_CORDOVA,
  SERVICE_UUID,
  CHAR_SAVE_ACC_UUID,
  CHAR_SET_KEY_UUID,
  CHAR_UNLOCK_UUID,
  CHAR_RESULT_UUID,
  CHAR_STATUS_UUID,
  CHAR_TIME_SYNC_UUID,
  BOX_CID_RESERVED,
  BOX_CID_SAVE_ACC,
  BOX_CID_SET_KEY,
  BOX_CID_UNLOCK,
  BOX_CID_RESULT,
  BOX_CID_STATUS,
  BOX_CID_TIME_SYNC,
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
  BOX_CHAR_RESULTS_INDEX,
  BOX_RESPONSE_MESSAGES,
};

var BOX_CHAR_RESULTS_INDEX$1 = bleBox.BOX_CHAR_RESULTS_INDEX;
var BOX_RESPONSE_MESSAGES$1 = bleBox.BOX_RESPONSE_MESSAGES;
var BOX_RES_OK$1 = bleBox.BOX_RES_OK;
var CHAR_RESULT_UUID$1 = bleBox.CHAR_RESULT_UUID;
var CHAR_UNLOCK_UUID$1 = bleBox.CHAR_UNLOCK_UUID;
var SERVICE_UUID$1 = bleBox.SERVICE_UUID;
var SERVICE_UUID_16$1 = bleBox.SERVICE_UUID_16;
export { BOX_CHAR_RESULTS_INDEX$1 as BOX_CHAR_RESULTS_INDEX, BOX_RESPONSE_MESSAGES$1 as BOX_RESPONSE_MESSAGES, BOX_RES_OK$1 as BOX_RES_OK, CHAR_RESULT_UUID$1 as CHAR_RESULT_UUID, CHAR_UNLOCK_UUID$1 as CHAR_UNLOCK_UUID, SERVICE_UUID$1 as SERVICE_UUID, SERVICE_UUID_16$1 as SERVICE_UUID_16 };
