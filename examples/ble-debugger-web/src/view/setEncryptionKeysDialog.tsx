
import * as React from 'react'
import { unionBy } from 'lodash'
import cx from 'classnames'
import {
    Tab,
    Dialog,
} from '@headlessui/react'

import { PostCube } from '../../../../lib'

import { formatKeyBuffer, parseKeyBuffer } from '../helpers'

export interface SetEncryptionKeysDialogProps {
    isOpen: boolean
    postCube: PostCube
    onClose()
}

export const SetEncryptionKeysDialog = ({ isOpen, postCube, onClose }) => {
    const [ keyIndex, setKeyIndex ] = React.useState(PostCube.EncryptionKeys[postCube.id]?.keyIndex)
    const [ publicKey, setPublicKey ] = React.useState(
        PostCube.EncryptionKeys[postCube.id]?.publicKey ?
            formatKeyBuffer(PostCube.EncryptionKeys[postCube.id]?.publicKey) : '')
    const [ privateKey, setPrivateKey ] = React.useState(
        PostCube.EncryptionKeys[postCube.id]?.privateKey ?
            formatKeyBuffer(PostCube.EncryptionKeys[postCube.id]?.privateKey) : '')

    const handleSave = () => {
        if (keyIndex) {
            postCube.setKeyIndex(keyIndex)
        }

        if (publicKey) {
            const publicKeyBuffer = parseKeyBuffer(publicKey)

            if (!publicKeyBuffer) {
                return
            }

            postCube.setPublicKey(publicKeyBuffer)
        }

        if (privateKey) {
            const privateKeyBuffer = parseKeyBuffer(privateKey)

            if (!privateKeyBuffer) {
                return
            }

            postCube.setPrivateKey(privateKeyBuffer)
        }

        onClose()
    }

    const handleKeyIndexChange = event => {
        setKeyIndex(Number(event.target.value))
    }

    const handlePublicKeyChange = event => {
        const value = event.target.value

        if (!/^[0-9a-fA-F]+$/.test(value)) {
            alert(`Please enter only valid HEX`)
            return
        }

        setPublicKey(value)
    }

    const handlePrivateKeyChange = event => {
        const value = event.target.value

        if (!/^[0-9a-fA-F]+$/.test(value)) {
            alert(`Please enter only valid HEX`)
            return
        }

        setPrivateKey(value)
    }

    return (
        <Dialog
            className='fixed z-10 inset-0 overflow-y-auto'
            open={isOpen}
            onClose={onClose}
        >
            <div className='flex items-center justify-center min-h-screen'>
                <Dialog.Overlay className='fixed inset-0 bg-black opacity-30' />
                <div
                    className='relative p-6 bg-white rounded-2xl'
                    style={{ minWidth: '60vw' }}
                >
                    <Dialog.Title>
                        <div className='mb-10 text-2xl'>Update encryption keys</div>
                        <div className='mb-10'>
                            <div className='mb-4'>
                                <div className='mb-1 font-bold'>
                                    Key index
                                </div>
                                <input
                                    className='p-1 w-full border rounded border-gray-400'
                                    placeholder='0'
                                    type='number'
                                    value={keyIndex ? keyIndex.toString() : ''}
                                    onChange={handleKeyIndexChange}
                                />
                            </div>
                            <div className='mb-4'>
                                <div className='mb-1 font-bold'>
                                    Public box key (HEX)
                                </div>
                                <input
                                    className='p-1 w-full border rounded border-gray-400'
                                    placeholder='7c52b9eff72abc63b862f584cbe3ac'
                                    value={publicKey}
                                    onChange={handlePublicKeyChange}
                                />
                            </div>
                            <div className='mb-4'>
                                <div className='mb-1 font-bold'>
                                    Private key (HEX)
                                </div>
                                <input
                                    className='p-1 w-full border rounded border-gray-400'
                                    placeholder='37b8f2ee5a3b3bc894d32e853d9cc2'
                                    value={privateKey}
                                    onChange={handlePrivateKeyChange}
                                />
                            </div>
                        </div>
                        <div className='text-right'>
                            <button
                                className={cx('py-2 px-3 rounded text-green-900 bg-green-300 hover:bg-green-500')}
                                onClick={handleSave}
                            >
                                Save keys
                            </button>
                        </div>
                    </Dialog.Title>
                </div>
            </div>
        </Dialog>
    )
}
