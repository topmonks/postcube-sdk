
import { COMMAND_ID_SIZE } from '../constants/bluetooth'
import { doISeriouslyHaveToUseSubtleCrypto } from '../helpers'

export const generateCommandId = async(): Promise<number> => {
    if (doISeriouslyHaveToUseSubtleCrypto()) {
        return window.crypto.getRandomValues(new Uint32Array(1))[0]
    }

    const { randomBytes } = await import('crypto')
    return randomBytes(COMMAND_ID_SIZE).readUInt32LE(0)
}
