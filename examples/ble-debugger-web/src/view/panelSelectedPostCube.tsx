
import * as React from 'react'
import moment from 'moment'
import cx from 'classnames'
import {
    Tab,
    Dialog,
} from '@headlessui/react'

import {
    PostCube,
} from '../../../../lib'
import { formatKeyBuffer } from '../helpers'
import { TabReadBattery } from './tabs/readBattery'
import { TabSyncTime } from './tabs/syncTime'
import { TabUnlock } from './tabs/unlock'
import { TabSetKey } from './tabs/setKey'
import { TabFactoryReset } from './tabs/factoryReset'
import { TabCustomCommand } from './tabs/customCommand'
import { TabCustomCommandResult } from './tabs/customCommandResult'
import { SetEncryptionKeysDialog } from './setEncryptionKeysDialog'

export interface PanelSelectedPostCubeProps {
    postCube: PostCube
}

export const PanelSelectedPostCube = ({ postCube }: PanelSelectedPostCubeProps) => {
    const [ displaySetEncryptionKeys, setDisplaySetEncryptionKeys ] = React.useState(false)

    const tabs = [{
        title: 'Read battery',
        component: <TabReadBattery postCube={postCube} />,
    }, {
        title: 'Sync time',
        component: <TabSyncTime postCube={postCube} />,
    }, {
        title: 'Unlock',
        component: <TabUnlock postCube={postCube} />,
    }, {
        title: 'Set key',
        component: <TabSetKey postCube={postCube} />,
    }, {
        title: 'Factory reset',
        component: <TabFactoryReset postCube={postCube} />,
    }, {
        title: 'Custom command',
        component: <TabCustomCommand postCube={postCube} />,
    }, {
        title: 'Custom command & result',
        component: <TabCustomCommandResult postCube={postCube} />,
    }]

    return (
        <div className='p-6 mx-48 my-6 bg-gray-50 rounded-md'>
            <div className='mb-6 text-2xl'>Selected PostCube: {postCube.id}</div>
            <div className='mb-6'>
                <div className='flex items-center'>
                    <button
                        className={cx('py-2 px-3 rounded bg-gray-300 hover:bg-gray-500')}
                        onClick={() => setDisplaySetEncryptionKeys(true)}
                    >
                        Update keys
                    </button>
                    <table className='flex-1 ml-6'>
                        <tbody>
                            <tr>
                                <td className='pr-2 whitespace-nowrap'>Key index:</td>
                                <td className='w-full'>
                                    <pre className='py-0.5 px-2 rounded-lg bg-gray-200'>
                                        {PostCube.EncryptionKeys[postCube.id]?.keyIndex || <span className='font-bold italic'>not set</span>}
                                    </pre>
                                </td>
                            </tr>
                            <tr>
                                <td className='pr-2 whitespace-nowrap'>Public box key:</td>
                                <td className='w-full py-2'>
                                    <pre className='py-0.5 px-2 rounded-lg bg-gray-200'>
                                        {PostCube.EncryptionKeys[postCube.id]?.publicKey ?
                                            formatKeyBuffer(PostCube.EncryptionKeys[postCube.id]?.publicKey) :
                                            <span className='font-bold italic'>not set</span>}
                                    </pre>
                                </td>
                            </tr>
                            <tr>
                                <td className='pr-2 whitespace-nowrap'>Private key:</td>
                                <td className='w-full'>
                                    <pre className='py-0.5 px-2 rounded-lg bg-gray-200'>
                                        {PostCube.EncryptionKeys[postCube.id]?.privateKey ?
                                            formatKeyBuffer(PostCube.EncryptionKeys[postCube.id]?.privateKey) :
                                            <span className='font-bold italic'>not set</span>}
                                    </pre>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <Tab.Group>
                <Tab.List>
                    {tabs.map((tab, index) => (
                        <Tab key={index} as={React.Fragment}>
                            {({ selected }) => (
                                <button className={cx('py-2 px-3 mr-3 rounded-tl rounded-tr hover:bg-gray-300', { 'bg-gray-200': selected })}>
                                    {tab.title}
                                </button>
                            )}
                        </Tab>
                    ))}
                </Tab.List>
                <div className='p-4 rounded-b rounded-tr bg-gray-200'>
                    <Tab.Panels>
                        {tabs.map((tab, index) => (
                            <Tab.Panel key={index}>
                                {tab.component}
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </div>
            </Tab.Group>
            <SetEncryptionKeysDialog
                postCube={postCube}
                isOpen={displaySetEncryptionKeys}
                onClose={() =>
                    setDisplaySetEncryptionKeys(false)}
            />
        </div>
    )
}
