
import { jSignal, Listener } from 'jsignal'

export interface Logger {
    readonly stdOut: jSignal<object>
    readonly stdErr: jSignal<object>

    ignoreDebug: boolean
    writeToProcessStd: boolean

    log(data: any, message?: string)
    debug(data: any, message?: string)
    info(data: any, message?: string)
    error(data: any, message?: string)
}

const stdOut = new jSignal<object>()
const stdErr = new jSignal<object>()

const composeLog = (level: number, data: any, message?: string) => {
    return {
        timestamp: new Date(),
        message: (!message && typeof data === 'string') ? data : message,
        data: (!message && typeof data === 'string') ? undefined : data,
    }
}

export const logger: Logger = {
    stdOut,
    stdErr,
    ignoreDebug: true,
    writeToProcessStd: true,
    log(data: any, message?: string) {
        logger.info(data, message)
    },
    debug(data: any, message?: string) {
        if (logger.ignoreDebug) {
            return
        }

        const log = composeLog(10, data, message)

        logger.stdOut.dispatch(log)

        if (logger.writeToProcessStd) {
            if (typeof process?.stdout?.write === 'function') {
                process.stdout.write(JSON.stringify(log) + '\n')
                return
            }

            console.log(log)
        }
    },
    info(data: any, message?: string) {
        const log = composeLog(20, data, message)

        logger.stdOut.dispatch(log)

        if (logger.writeToProcessStd) {
            if (typeof process?.stdout?.write === 'function') {
                process.stdout.write(JSON.stringify(log) + '\n')
                return
            }

            console.log(log)
        }
    },
    error(data: any, message?: string) {
        const log = composeLog(40, data, message)

        logger.stdErr.dispatch(log)

        if (logger.writeToProcessStd) {
            if (typeof process?.stderr?.write === 'function') {
                process.stderr.write(JSON.stringify(log) + '\n')
                return
            }

            console.error(log)
        }
    },
}
