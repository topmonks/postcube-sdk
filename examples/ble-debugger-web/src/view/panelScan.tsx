
import * as React from 'react'
import cx from 'classnames'
import { unionBy } from 'lodash'

import { PostCube, ScanResult } from '../../../../lib'
import { usePostCubeBLE } from '../hooks'

export interface PanelScanProps {
    onPostCubeSelect(postCube: PostCube)
}

export const PanelScan = ({ onPostCubeSelect }: PanelScanProps) => {
    const [ namePrefix, setNamePrefix ] = React.useState('PostCube')
    const [ discoveredPostCubes, setDiscoveredPostCubes ] = React.useState([])

    const handlePostCubeDiscovered = (postCube) => {
        setDiscoveredPostCubes(unionBy([
            postCube,
            ...discoveredPostCubes,
        ], ({ deviceId }) => deviceId))
    }

    const {
        scanForPostCubes,
    } = usePostCubeBLE(handlePostCubeDiscovered)

    const [ scanResult, setScanResult ] = React.useState<ScanResult>()

    const handleScanPostCubes = async() => {
        try {
            const scanResult = await scanForPostCubes({ namePrefix }, {
                availableDevices: [{
                    deviceId: 'foo',
                    name: 'PostCube 312724',
                }],
            })
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

    return (
        <div className='p-6 mx-48 my-6 bg-gray-50 rounded-md'>
            <div className='mb-6'>
                Name prefix:&nbsp;
                <input
                    className='p-1 border rounded border-gray-400'
                    value={namePrefix}
                    onChange={event =>
                        setNamePrefix(event.target.value)}
                />
            </div>
            <button
                className={cx('p-2 rounded', !!scanResult ? 'text-red-900 bg-red-300 hover:bg-red-500' : 'text-green-900 bg-green-300 hover:bg-green-500')}
                onClick={!!scanResult ? handleStopScan : handleScanPostCubes}
            >
                {!!scanResult ? 'Stop scan' : 'Scan PostCubes'}
            </button>
            {(!!scanResult || discoveredPostCubes.length > 0) && (
                <div>
                    {!!scanResult && <strong>Scanning for PostCubes...</strong>}<br/>
                    <table>
                        <thead>
                            <tr>
                                <td>Cube ID</td>
                                <td>Device name</td>
                            </tr>
                        </thead>
                        <tbody>
                            {discoveredPostCubes.map((postCube, index) =>
                                <tr key={`${index}-${postCube.deviceId}`}>
                                    <td className='px-2'>{postCube.id}</td>
                                    <td className='px-2'>{postCube.name}</td>
                                    <td className='px-2'>
                                        <button
                                            className={cx('p-1 rounded bg-gray-300 hover:bg-gray-500')}
                                            onClick={() => {
                                                handleStopScan()
                                                onPostCubeSelect(postCube)
                                            }}
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
    )
}
