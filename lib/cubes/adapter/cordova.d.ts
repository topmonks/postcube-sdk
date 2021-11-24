
declare module 'cordova-plugin-ble-central/www/ble' {
    export interface Peripheral {
        name: string
        id: string
        rssi: number
        advertising: ArrayBuffer|object // ArrayBuffer - Android; object - iOS
    }

    export interface withPromises {
        stopScan(): Promise<void>
        startScan(
            services: string[],
            onSuccess: (peripheral: Peripheral) => any,
            onFailure: (err: any) => any,
        ): Promise<void>

        stopNotification(deviceId: string, serviceUUID: string, characteristicUUID: string): Promise<void>
        startNotification(
            deviceId: string,
            serviceUUID: string,
            characteristicUUID: string,
            onSuccess: (buffer: ArrayBuffer) => any,
            onFailure: (err: any) => any,
        ): Promise<void>
    }
}
