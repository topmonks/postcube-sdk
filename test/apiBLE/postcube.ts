
import { expect } from 'chai'
import { Listener } from 'jsignal'

import { PostCube, StopNotifications } from '../../lib/apiBLE/postcube'

class EmptyPostCube extends PostCube {
    deviceId: string
    isConnected: boolean

    connect(timeoutMs?: number): Promise<void> {
        throw new Error('Method not implemented')
    }

    disconnect(timeoutMs?: number): Promise<void> {
        throw new Error('Method not implemented')
    }

    read(serviceUUID: string, characteristicUUID: string, timeoutMs?: number): Promise<DataView> {
        throw new Error('Method not implemented')
    }

    write(serviceUUID: string, characteristicUUID: string, value: DataView, timeoutMs?: number): Promise<void> {
        throw new Error('Method not implemented')
    }

    listenForNotifications(serviceUUID: string, characteristicUUID: string, listener: Listener<DataView>, timeoutMs?: number): Promise<StopNotifications> {
        throw new Error('Method not implemented')
    }
}

export const runApiBLEPostcubeTests = () => {
    it('should parse name from first argument in constructor', async() => {
        const id = '123456'
        const name = `PostCube ${id}`

        const emptyPostCube = new EmptyPostCube(name)

        expect(emptyPostCube.name).to.equal(name)
        expect(emptyPostCube.id).to.equal(id)
        expect(emptyPostCube.isDev).to.be.false
    })
}
