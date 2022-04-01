
import * as React from 'react'
import { unionBy } from 'lodash'
import cx from 'classnames'

import { PostCube } from '../../../../../lib'

export interface TabReadBatteryProps {
    postCube: PostCube
}

export const TabReadBattery = ({ postCube }: TabReadBatteryProps) => {
    const [ battery, setBattery ] = React.useState<number>()
    const [ isReadingBattery, setIsReadingBattery ] = React.useState(false)

    const handleReadBattery = async() => {
        setIsReadingBattery(true)

        try {
            const battery = await postCube.readBattery()
            setBattery(battery)
        } catch (err) {
            alert(err)
            console.error(err)
        } finally {
            setIsReadingBattery(false)
        }
    }

    return (
        <div>
            <div className='mb-4'>
                <div className='mb-1 font-bold'>
                    Battery
                </div>
                <input
                    className='p-1 border rounded border-gray-400'
                    value={isReadingBattery ? 'reading...' : (battery || 'undefined').toString()}
                    readOnly
                />
            </div>
            <button
                className={cx('p-2 rounded text-green-900 bg-green-300 hover:bg-green-500')}
                onClick={handleReadBattery}
            >
                Read battery
            </button>
        </div>
    )
}
