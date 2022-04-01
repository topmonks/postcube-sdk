
import * as React from 'react'
import { unionBy } from 'lodash'
import cx from 'classnames'

import { PostCube } from '../../../../../lib'

export const TabUnlock = ({ postCube }) => {
    const [ lockId, setLockId ] = React.useState(0)

    const handleWriteUnlock = async() => {
        try {
            await postCube.writeUnlock(0)
        } catch (err) {
            alert(err)
            console.error(err)
        }
    }

    return (
        <div>
            <div className='mb-4'>
                <div className='mb-1 font-bold'>
                    Lock ID
                </div>
                <input
                    className='p-1 border rounded border-gray-400'
                    type='number'
                    value={lockId.toString()}
                    onChange={event =>
                        setLockId(Number(event.target.value))}
                />
            </div>
            <button
                className={cx('p-2 rounded text-green-900 bg-green-300 hover:bg-green-500')}
                onClick={handleWriteUnlock}
            >
                Write 'Unlock' command
            </button>
        </div>
    )
}
