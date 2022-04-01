
import * as React from 'react'
import { unionBy } from 'lodash'
import cx from 'classnames'

import { PostCube } from '../../../../../lib'

export const TabFactoryReset = ({ postCube }) => {
    const handleWriteFactoryReset = async() => {
        try {
            await postCube.writeFactoryReset()
        } catch (err) {
            alert(err)
            console.error(err)
        }
    }

    return (
        <div>
            <button
                className={cx('p-2 rounded text-green-900 bg-green-300 hover:bg-green-500')}
                onClick={handleWriteFactoryReset}
            >
                Write 'FactoryReset' command
            </button>
        </div>
    )
}
