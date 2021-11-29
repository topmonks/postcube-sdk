
import * as React from 'react'
import { unionBy } from 'lodash'
import cx from 'classnames'
import {
    Tab,
} from '@headlessui/react'

import {
    Cube,
    Cubes,
    ScanResult,
    Platform,
    useCube,
    useCubes,
} from '../../..'
import { TabBattery } from './tabBattery'
import { TabSendPacket } from './tabSendPacket'

Cubes.platform = Platform.web

export const Application = ({}) => {
    const [ namePrefix, setNamePrefix ] = React.useState('PostCube')
    const [ discoveredCubes, setDiscoveredCubes ] = React.useState<Cube[]>([])

    const handleCubeDiscovered = (cube: Cube) => {
        setDiscoveredCubes(unionBy([
            cube,
            ...discoveredCubes,
        ], ({ deviceId }) => deviceId))
    }

    const {
        scanForCubes,
    } = useCubes(handleCubeDiscovered)

    const [ scanResult, setScanResult ] = React.useState<ScanResult>()

    const handleScanCubes = async() => {
        try {
            const scanResult = await scanForCubes({ namePrefix })
            setScanResult(scanResult)
        } catch (err) {
            console.error(err)
        }
    }

    const handleStopScan = async() => {
        if (!scanResult) {
            return
        }

        scanResult.stopScan()
        setScanResult(null)
    }

    const [ selectedCube, setSelectedCube ] = React.useState<Cube>()

    const cube = useCube(selectedCube)

    const handleCubeConnect = (cube: Cube) => {
        setSelectedCube(cube)
    }

    const tabs = [{
        title: 'Read battery',
        component: <TabBattery cube={cube} />,
    }, {
        title: 'Send packet',
        component: <TabSendPacket cube={cube} />,
    }]

    return (
        <div className='bg-gray-200 min-h-screen'>
            <div className='text-4xl mx-48 pt-6'>Cube Inspector</div>
            <div className='p-6 mx-48 my-6 bg-gray-50 rounded-md'>
                Name prefix:&nbsp;
                <input
                    className='p-1 border rounded border-gray-400'
                    value={namePrefix}
                    onChange={event => setNamePrefix(event.target.value)}
                />
            </div>
            <div className='p-6 mx-48 my-6 bg-gray-50 rounded-md'>
                <button
                    className={cx('p-2 rounded', scanResult ? 'bg-red-300 hover:bg-red-500' : 'bg-green-300 hover:bg-green-500')}
                    onClick={scanResult ? handleStopScan : handleScanCubes}
                >
                    {scanResult ? 'Stop scan' : 'Scan cubes'}
                </button>
                {(scanResult || discoveredCubes.length > 0) && (
                    <div>
                        {scanResult && <strong>Scanning for Cubes...</strong>}<br/>
                        <table>
                            <thead>
                                <tr>
                                    <td>Cube ID</td>
                                    <td>Device name</td>
                                </tr>
                            </thead>
                            <tbody>
                                {discoveredCubes.map((cube, index) =>
                                    <tr key={`${index}-${cube.deviceId}`}>
                                        <td className='px-2'>{cube.id}</td>
                                        <td className='px-2'>{cube.name}</td>
                                        <td className='px-2'>
                                            <button
                                                className={cx('p-1 rounded bg-gray-300 hover:bg-gray-500')}
                                                onClick={() => handleCubeConnect(cube)}
                                            >
                                                Connect
                                            </button>
                                        </td>
                                    </tr>)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {cube && (
                <div className='p-6 mx-48 my-6 bg-gray-50 rounded-md'>
                    <div className='mb-6 text-2xl'>Selected cube: {cube.id}</div>
                    <Tab.Group>
                        <Tab.List>
                            {tabs.map((tab, index) => (
                                <Tab key={index} as={React.Fragment}>
                                    {({ selected }) => (
                                        <button className={cx('py-2 px-3 mr-3 rounded-tl rounded-tr', selected ? 'bg-blue-100 hover:bg-blue-200' : 'bg-gray-100 hover:bg-gray-200')}>
                                            {tab.title}
                                        </button>
                                    )}
                                </Tab>
                            ))}
                        </Tab.List>
                        <div className='p-4 rounded-b rounded-tr bg-gray-100'>
                            <Tab.Panels>
                                {tabs.map((tab, index) => (
                                    <Tab.Panel key={index}>
                                        {tab.component}
                                    </Tab.Panel>
                                ))}
                            </Tab.Panels>
                        </div>
                    </Tab.Group>
                </div>
            )}
        </div>
    )
}
