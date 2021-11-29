
import * as React from 'react'
import { unionBy } from 'lodash'
import cx from 'classnames'

import { Cube } from '../../..'

export interface TabBatteryProps {
    cube: Cube
}

export const TabBattery = ({ cube }: TabBatteryProps) => {
    const [ isReadingBattery, setIsReadingBattery ] = React.useState(false)
    const [ battery, setBattery ] = React.useState(0)
    const [ error, setError ] = React.useState()

    const handleReadBattery = async() => {
        setIsReadingBattery(true)
        setError(null)

        try {
            const battery = await cube.readBattery()
            setBattery(battery)
        } catch (err) {
            setError(err)
            console.error(err)
        } finally {
            setIsReadingBattery(false)
        }
    }

    return (
        <div>
            <button
                className={'p-2 rounded bg-gray-300 hover:bg-gray-500'}
                onClick={handleReadBattery}
            >
                Read battery
            </button>
            <pre className='mt-2'>
                {JSON.stringify({ isReadingBattery, battery, error }, null, 4)}
            </pre>
        </div>
    )
}
