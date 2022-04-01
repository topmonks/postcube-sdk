
import * as React from 'react'
import moment from 'moment'
import cx from 'classnames'
import {
    Switch,
} from '@headlessui/react'

import {
    PostCubeLogger,
} from '../../../../lib'

export const PanelLogs = ({}) => {
    const [ ignoreDebug, setIgnoreDebug ] = React.useState(PostCubeLogger.ignoreDebug)
    const [ logs, setLogs ] = React.useState([])

    const handleLog = log => {
        setLogs([ log, ...logs ])
    }

    React.useEffect(() => {
        PostCubeLogger.stdOut.listen(handleLog)
        PostCubeLogger.stdErr.listen(handleLog)

        return () => {
            PostCubeLogger.stdOut.unlisten(handleLog)
            PostCubeLogger.stdErr.unlisten(handleLog)
        }
    }, [logs])

    const toggleIgnoreDebug = (_ignoreDebug) => {
        PostCubeLogger.ignoreDebug =
            typeof _ignoreDebug === 'boolean' ?
                _ignoreDebug : !PostCubeLogger.ignoreDebug

        setIgnoreDebug(PostCubeLogger.ignoreDebug)
    }

    const renderLog = (log, index) => {
        return (
            <tr
                key={`${index}-${log?.timestamp}`}
                className='cursor-pointer hover:bg-gray-200'
            >
                <td className='p-2 rounded-l whitespace-nowrap'>
                    {moment(log?.timestamp).format('DD.MM. HH:mm:ss')}
                </td>
                <td className='p-2'>
                    {log?.message}
                </td>
                <td className='p-2 rounded-r'>
                    {JSON.stringify(log?.data)}
                </td>
            </tr>
        )
    }

    return (
        <div className='p-6 mx-48 my-6 bg-gray-50 rounded-md'>
            <div className='flex items-center mb-6'>
                <span className='flex-1 text-2xl'>PostCube logs</span>
                <div>
                    <Switch.Group>
                        <div className='flex items-center'>
                            <Switch.Label className='mr-4'>Log all levels (including debug):</Switch.Label>
                            <Switch
                                checked={ignoreDebug}
                                onChange={toggleIgnoreDebug}
                                className={cx('relative inline-flex items-center h-6 rounded-full w-11 transition-colors', {
                                    'bg-blue-600': !ignoreDebug,
                                    'bg-gray-200': ignoreDebug,
                                })}
                            >
                                <span
                                    className={cx('inline-block w-4 h-4 transform bg-white rounded-full transition-transform', {
                                        'translate-x-6': !ignoreDebug,
                                        'translate-x-1': ignoreDebug,
                                    })}
                                />
                            </Switch>
                            <Switch.Label className='ml-4'>
                                {ignoreDebug ? 'No' : 'Yes'}
                            </Switch.Label>
                        </div>
                    </Switch.Group>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <td className='px-2'>Timestamp</td>
                        <td className='px-2'>Message</td>
                        <td className='px-2'>Data</td>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(renderLog)}
                </tbody>
            </table>
        </div>
    )
}
