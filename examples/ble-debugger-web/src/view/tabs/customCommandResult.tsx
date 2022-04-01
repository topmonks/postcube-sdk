
import * as React from 'react'
import { unionBy } from 'lodash'
import cx from 'classnames'

import { PostCube } from '../../../../../lib'
import { parseKeyBuffer } from '../../helpers'

export const TabCustomCommandResult = ({ postCube }) => {
    const [ customCommandHex, setCustomCommandHex ] = React.useState('')
    const [ result, setResult ] = React.useState()

    const handleWriteCommandAndReadResult = async() => {
        try {
            setResult(null)

            const customCommand = parseKeyBuffer(customCommandHex)

            if (!customCommand) {
                return
            }

            const result = await postCube.writeCommandAndReadResult(customCommand)
            setResult(result)
        } catch (err) {
            alert(err)
            console.error(err)
        }
    }

    const handleCustomCommandChange = event => {
        const value = event.target.value

        if (value && !/^[0-9a-fA-F]+$/.test(value)) {
            alert(`Please enter only valid HEX`)
            return
        }

        setCustomCommandHex(value)
    }

    return (
        <div>
            <div className='mb-4'>
                <div className='mb-1 font-bold'>
                    Custom command
                </div>
                <input
                    className='p-1 w-full border rounded border-gray-400'
                    placeholder='9a3b734de82abc23b862f572bbf6c6'
                    value={customCommandHex}
                    onChange={handleCustomCommandChange}
                />
            </div>
            <div className='mb-4'>
                <div className='mb-1 font-bold'>
                    Result
                </div>
                <pre className='py-1 px-3 rounded-lg bg-gray-200'>
                    {result ? JSON.stringify(result, null, 4) : '-'}
                </pre>
            </div>
            <button
                className={cx('p-2 rounded text-green-900 bg-green-300 hover:bg-green-500')}
                onClick={handleWriteCommandAndReadResult}
            >
                Write command & read result
            </button>
        </div>
    )
}