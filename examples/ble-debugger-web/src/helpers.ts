
export const formatKeyBuffer = (buffer) => {
    let bufferHex = ''

    for (let index = 0; index < buffer.length; index++) {
        let hex = buffer[index].toString(16)
        bufferHex += hex.length === 1 ? ('0' + hex) : hex
    }

    return bufferHex
}

export const parseKeyBuffer = (value) => {
    if (!/^[0-9a-fA-F]+$/.test(value) || value.length % 2 !== 0) {
        alert(`Expected odd number of valid HEX characters. Got: ${value}`)
        return
    }

    const buffer = []

    for (let index = 0; index < value.length; index += 2) {
        buffer.push(parseInt(`${value[index]}${value[index + 1]}`, 16))
    }

    return new Uint8Array(buffer)
}
