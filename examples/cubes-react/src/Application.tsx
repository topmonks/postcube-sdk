
import * as React from 'react'
import { unionBy } from 'lodash'
import cx from 'classnames'

import { Cube, ScanResult, useCube, useCubes } from '../../../lib'

export const Application = ({}) => {
    const [ namePrefix, setNamePrefix ] = React.useState('PostCube')
    
    // const [ batteryLevel, setBatteryLevel ] = React.useState<number>()

    // const cube = useCube(selectedCube)
    // const [ selectedCube, setSelectedCube ] = React.useState<Cube>()
    // const handleSelectCube = async() => {
    //     try {
    //         const cube = await Cubes.requestCube(namePrefix)
    //         setSelectedCube(cube)
    //     } catch (err) {
    //         console.error(err)
    //     }
    // }

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

    // const handleReadBattery = async() => {
    //     const currentBatteryLevel = await cube.getBattery()
    //     setBatteryLevel(currentBatteryLevel)
    // }

    return (
        <div className='bg-gray-200 min-h-screen'>
            <div className='text-4xl mx-48 pt-6'>Scan Cubes - React</div>
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
                    <div className='mb-2 text-2xl'>Selected cube</div>
                    <pre>
                        {JSON.stringify(cube, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )
}
