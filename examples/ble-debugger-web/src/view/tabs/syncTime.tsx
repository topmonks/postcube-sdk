
import * as React from 'react'
import { unionBy } from 'lodash'
import cx from 'classnames'

import { PostCube } from '../../../../../lib'

export const TabSyncTime = ({ postCube }) => {
    const [ timestamp, setTimestamp ] = React.useState(0)

    const handleWriteSyncTime = async() => {
        try {
            await postCube.writeSyncTime(timestamp)
        } catch (err) {
            alert(err)
            console.error(err)
        }
    }

    return (
        <div>
            <div className='mb-4'>
                <div className='mb-1 font-bold'>
                    Timestamp
                </div>
                <input
                    className='p-1 border rounded border-gray-400'
                    type='number'
                    value={timestamp.toString()}
                    onChange={event =>
                        setTimestamp(Number(event.target.value))}
                />
            </div>
            <button
                className={cx('p-2 rounded text-green-900 bg-green-300 hover:bg-green-500')}
                onClick={handleWriteSyncTime}
            >
                Write 'SyncTime' command
            </button>
        </div>
    )
}
