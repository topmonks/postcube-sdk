
export enum BluetoothAdapter {
    web = 'web',
    cordova = 'cordova',
    capacitor = 'capacitor',
}

export interface Adapter {
    searchForCubes()
}
