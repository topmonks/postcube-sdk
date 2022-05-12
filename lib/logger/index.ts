
import { jSignal, Listener } from 'jsignal'

const _process = ((typeof process !== 'undefined' && !!process) ? process || {} : {}) as NodeJS.Process

export interface PostCubeLogger {
    readonly stdOut: jSignal<object>
    readonly stdErr: jSignal<object>

    ignoreDebug: boolean
    writeToProcessStd: boolean

    log(data: any, message?: string)
    debug(data: any, message?: string)
    info(data: any, message?: string)
    warn(data: any, message?: string)
    error(data: any, message?: string)
}

const stdOut = new jSignal<object>()
const stdErr = new jSignal<object>()

const composeLog = (logLevel: number, data: any, message?: string) => {
    return {
        logLevel,
        timestamp: new Date(),
        message: (!message && typeof data === 'string') ? data : message,
        data: (!message && typeof data === 'string') ? undefined : data,
    }
}

export const PostCubeLogger: PostCubeLogger = {
    stdOut,
    stdErr,
    ignoreDebug: true,
    writeToProcessStd: true,
    log(data: any, message?: string) {
        PostCubeLogger.info(data, message)
    },
    debug(data: any, message?: string) {
        if (PostCubeLogger.ignoreDebug) {
            return
        }

        const log = composeLog(10, data, message)

        PostCubeLogger.stdOut.dispatch(log)

        if (PostCubeLogger.writeToProcessStd) {
            if (typeof _process?.stdout?.write === 'function') {
                _process.stdout.write(JSON.stringify(log) + '\n')
                return
            }
        }

        console.debug(log)
    },
    info(data: any, message?: string) {
        const log = composeLog(20, data, message)

        PostCubeLogger.stdOut.dispatch(log)

        if (PostCubeLogger.writeToProcessStd) {
            if (typeof _process?.stdout?.write === 'function') {
                _process.stdout.write(JSON.stringify(log) + '\n')
                return
            }
        }

        console.log(log)
    },
    warn(data: any, message?: string) {
        const log = composeLog(30, data, message)

        PostCubeLogger.stdOut.dispatch(log)

        if (PostCubeLogger.writeToProcessStd) {
            if (typeof _process?.stdout?.write === 'function') {
                _process.stdout.write(JSON.stringify(log) + '\n')
                return
            }
        }

        console.warn(log)
    },
    error(data: any, message?: string) {
        const log = composeLog(40, data, message)

        PostCubeLogger.stdErr.dispatch(log)

        if (PostCubeLogger.writeToProcessStd) {
            if (typeof _process?.stderr?.write === 'function') {
                _process.stderr.write(JSON.stringify(log) + '\n')
                return
            }
        }

        console.error(log)
    },
}
