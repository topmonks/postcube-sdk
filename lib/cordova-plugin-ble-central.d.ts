
export interface CordovaBLEDevice {
    id: string
    name: string
    advertising?: number[]
    rssi?: number
}

export interface CordovaBLEDeviceConnected extends CordovaBLEDevice {
    services: string[]
    characteristics: {
        service: string
        characteristic: string
        properties: string[]
        descriptors: {
            uuid: string
        }[]
    }[]
}

export type OnDiscovery = (cordovaBLEDevice: CordovaBLEDevice) => any
export type OnRead = (value: ArrayBuffer) => any

// declare module 'cordova-plugin-ble-central/www/ble' {

    interface WWW {
        connect(deviceId: string, onSuccess: Function, onFailure: Function): Promise<any>
        disconnect(deviceId: string, onSuccess: Function, onFailure: Function): Promise<any>

        isEnabled(onSuccess: Function, onFailure: Function)
        isConnected(deviceId: string, onSuccess: Function, onFailure: Function)

        startScan(services: string[], onDiscovery: OnDiscovery, onFailure: Function): Promise<any>
        stopScan(onSuccess: Function, onFailure: Function): Promise<any>

        startNotification(deviceId: string, serviceUUID: string, charUUID: string, onSuccess: Function, onFailure: Function)
        stopNotification(deviceId: string, serviceUUID: string, charUUID: string, onSuccess: Function, onFailure: Function) // success callback is called when the descriptor 0x2902 is written

        startStateNotifications(onSuccess: Function, onFailure: Function)
        stopStateNotifications(onSuccess: Function, onFailure: Function): Promise<any>

        read(deviceId: string, serviceUUID: string, charUUID: string, onSuccess: OnRead, onFailure: Function)
        write(deviceId: string, serviceUUID: string, charUUID: string, value: ArrayBuffer, onSuccess: Function, onFailure: Function)
    }

//     export default WWW

// }
