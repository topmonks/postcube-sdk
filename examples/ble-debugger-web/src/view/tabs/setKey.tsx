
import * as React from 'react'
import { unionBy } from 'lodash'
import cx from 'classnames'

import { PostCube } from '../../../../../lib'
import { parseKeyBuffer } from '../../helpers'

export const TabSetKey = ({ postCube }) => {
    const [ secretCode, setSecretCode ] = React.useState('')
    const [ keyIndex, setKeyIndex ] = React.useState(0)
    const [ publicKeyHex, setPublicKeyHex ] = React.useState('')
    const [ expireAt, setExpireAt ] = React.useState(0)

    const handleWriteSetKey = async() => {
        try {
            const publicKey = parseKeyBuffer(publicKeyHex)

            if (!publicKey) {
                return
            }

            await postCube.writeSetKey(secretCode, keyIndex, publicKey, expireAt)
        } catch (err) {
            alert(err)
            console.error(err)
        }
    }

    const handlePublicKeyChange = event => {
        const value = event.target.value

        if (value && !/^[0-9a-fA-F]+$/.test(value)) {
            alert(`Please enter only valid HEX`)
            return
        }

        setPublicKeyHex(value)
    }

    return (
        <div>
            <div className='mb-4'>
                <div className='mb-1 font-bold'>
                    Secret code
                </div>
                <input
                    className='p-1 border rounded border-gray-400'
                    placeholder='000000'
                    value={secretCode}
                    onChange={event =>
                        setSecretCode(event.target.value)}
                />
            </div>
            <div className='mb-4'>
                <div className='mb-1 font-bold'>
                    Key index
                </div>
                <input
                    className='p-1 border rounded border-gray-400'
                    type='number'
                    value={keyIndex.toString()}
                    onChange={event =>
                        setKeyIndex(Number(event.target.value))}
                />
            </div>
            <div className='mb-4'>
                <div className='mb-1 font-bold'>
                    Public box key (HEX)
                </div>
                <input
                    className='p-1 w-full border rounded border-gray-400'
                    placeholder='7c52b9eff72abc63b862f584cbe3ac'
                    value={publicKeyHex}
                    onChange={handlePublicKeyChange}
                />
            </div>
            <div className='mb-4'>
                <div className='mb-1 font-bold'>
                    Expire at
                </div>
                <input
                    className='p-1 border rounded border-gray-400'
                    type='number'
                    value={expireAt.toString()}
                    onChange={event =>
                        setExpireAt(Number(event.target.value))}
                />
            </div>
            <button
                className={cx('p-2 rounded text-green-900 bg-green-300 hover:bg-green-500')}
                onClick={handleWriteSetKey}
            >
                Write 'SetKey' command
            </button>
        </div>
    )
}
