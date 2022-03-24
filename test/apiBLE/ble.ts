
import { expect } from 'chai'

import { PostCube } from '../../lib/apiBLE/postcube'
import { PostCubeBLE, Platform } from '../../lib/apiBLE/ble'

export const runApiBLETests = () => {
    before(async() => {
        PostCubeBLE.platform = Platform.mock
    })

    it('should request one device and return it if found', async() => {
        const deviceId = 'foo'
        const name = 'PostCube 112233'

        const postcube = await PostCubeBLE.requestPostCube('PostCube', {
            availableDevices: [{ deviceId, name }],
        })

        expect(postcube.deviceId).to.equal(deviceId)
        expect(postcube.name).to.equal(name)
    })

    // it('should scan for devices with prefix', async(done) => {
    //     // const deviceId = 'foo'
    //     // const name = 'PostCube 112233'

    //     // const handleDiscovery = (postcube: PostCube) => {
    //     //     console.log(`postcube discovered`)

    //     //     expect(postcube.deviceId).to.equal(deviceId)
    //     //     expect(postcube.name).to.equal(name)

    //     //     done(null)
    //     // }

    //     // const scanResult = await PostCubeBLE.scanForPostCubes({
    //     //     namePrefix: 'PostCube',
    //     //     onDiscovery: handleDiscovery,
    //     // }, {
    //     //     availableDevices: [{ deviceId, name }],
    //     // })

    //     // console.log(`got scanResult:`, scanResult)

    //     // // scanResult.stopScan
    // })
}
