
import { Listener } from 'jsignal'

import { PostCubeLogger } from '../logger'
import {
    PostCubeVersion,
    DEFAULT_TIMEOUT_CONNECT,
    DEFAULT_TIMEOUT_DISCONNECT,
    DEFAULT_TIMEOUT_IO,
    DEFAULT_TIMEOUT_LISTEN,
    DEPRECATED_SERVICE_UUID,
    DEPRECATED_SERVICE_UUID_16,
    SERVICE_BATTERY_UUID,
    SERVICE_UUID,
    SERVICE_UUID_16,
} from '../constants/bluetooth'
import { bleErrors } from '../errors'
import { resolveVersionFromAvailableServices, templater, withTimeoutRace } from '../helpers'
import {
    PostCube,
    ScanOptions,
    ScanResult,
    Unwatch,
} from './postcube'

export const isEnabled = async(): Promise<boolean> => {
    return (
        typeof navigator?.bluetooth?.getAvailability === 'function'
        && await navigator.bluetooth.getAvailability()
    )
}

export const requestPostCube = async(
    namePrefix: string,
    services: (string|number)[] = [
        SERVICE_BATTERY_UUID,
        SERVICE_UUID,
        SERVICE_UUID_16,
        DEPRECATED_SERVICE_UUID,
        DEPRECATED_SERVICE_UUID_16,
    ],
): Promise<PostCube> => {
    const requestDeviceOptions = {
        acceptAllDevices: false,
        optionalServices: services,
        filters: [{
            namePrefix,
            // services: [],
        }],
    }

    PostCubeLogger.debug(requestDeviceOptions, `Request device options [${PostCubeWeb.PlatformName}]`)

    const device = await navigator.bluetooth.requestDevice(requestDeviceOptions)

    return new PostCubeWeb(device)
}

export const scanForPostCubes = async(
    options: ScanOptions = {},
    services: (string|number)[] = [
        SERVICE_BATTERY_UUID,
        SERVICE_UUID,
        SERVICE_UUID_16,
        DEPRECATED_SERVICE_UUID,
        DEPRECATED_SERVICE_UUID_16,
    ],
): Promise<ScanResult> => {
    PostCubeLogger.warn(
        { options, services },
        `Invoked method scanForPostCubes is a polyfill on platform [${PostCubeWeb.PlatformName}]`,
    )

    return {
        async stopScan() {},
        promise: requestPostCube(options.namePrefix, services).then(postCube => {
            if (typeof options?.onDiscovery === 'function') {
                options.onDiscovery(postCube)
            }
        }),
    }
}

export class PostCubeWeb extends PostCube {
    static PlatformName = 'WebBluetooth'

    private device: BluetoothDevice

    private _version:                PostCubeVersion
    private _detectVersionOnConnect: boolean = true
    private _cachedServices:         Record<string, BluetoothRemoteGATTService> = {}
    private _cachedCharacteristics:  Record<string, BluetoothRemoteGATTCharacteristic> = {}
    private _enabledNotifications:   Record<string, boolean> = {}

    get deviceId(): string {
        return this.device?.id
    }

    get isConnected(): boolean {
        return !!this.device?.gatt?.connected || !!this.device?.gatt?.device?.gatt?.connected
    }

    get version(): PostCubeVersion {
        return this._version
    }

    constructor(device: BluetoothDevice) {
        super(device?.name)

        this.device = device

        if (typeof this?.device?.watchAdvertisements === 'function') {
            this.device.addEventListener('advertisementreceived', event =>{
                this.handleAdvertisementReceived(event)
            })

            this.device.watchAdvertisements()

            this._detectVersionOnConnect = false
        }

        this.connect().then(async() => {
            PostCubeLogger.info({}, this.tmpl(`Auto-connected to %id_platform%`))

            await this.startResultNotificationsV1()
        }).catch(err => {
            PostCubeLogger.error({ err }, this.tmpl(`Failed to auto-connect to %id_platform%`))
        })
    }

    protected tmpl(string: string) {
        return templater({
            platform: PostCubeWeb.PlatformName,
            id: this.id,
            version: this.version,
        }).parse(string)
    }

    private async handleGattServerDisconnected(event: Event) {
        PostCubeLogger.debug({ event }, this.tmpl(`Disconnected from %id_platform%`))

        this.onChange.dispatch(this)
    }

    private async handleAdvertisementReceived(event: Event) {
        console.log(this.tmpl('Advertisement received on %id_platform%'))
        console.log('event:', event)
        // Detect version
    }

    private async getService(serviceUUID: string): Promise<BluetoothRemoteGATTService> {
        if (this._cachedServices[serviceUUID]) {
            return this._cachedServices[serviceUUID]
        }

        this._cachedServices[serviceUUID] =
            await this.device?.gatt?.getPrimaryService(serviceUUID)

        return this._cachedServices[serviceUUID]
    }

    private async getCharacteristic(
        serviceUUID: string,
        characteristicUUID: string,
    ): Promise<BluetoothRemoteGATTCharacteristic> {
        const cacheKey = `${serviceUUID}:${characteristicUUID}`

        if (this._cachedCharacteristics[cacheKey]) {
            return this._cachedCharacteristics[cacheKey]
        }

        const service = await this.getService(serviceUUID)

        this._cachedCharacteristics[cacheKey] =
            await service.getCharacteristic(characteristicUUID)

        return this._cachedCharacteristics[cacheKey]
    }

    async connect(timeoutMs: number = DEFAULT_TIMEOUT_CONNECT): Promise<void> {
        PostCubeLogger.debug(this.tmpl(`Connecting to %id_platform%`))

        if (this.isConnected) {
            PostCubeLogger.warn({ postCube: this }, this.tmpl(`Already connected to %id_platform%`))
            return
        }

        await withTimeoutRace(async() => {
            await this.device.gatt.connect()

            this.device.gatt.device.addEventListener('gattserverdisconnected', this.handleGattServerDisconnected)

            if (this._detectVersionOnConnect) {
                const primaryServices = await this.device.gatt.getPrimaryServices()
    
                this._version = await resolveVersionFromAvailableServices(
                    primaryServices.map(service => service.uuid),
                )
            }

        }, timeoutMs, bleErrors.timeout(this.tmpl(`Timed out connecting to %id_platform%`)))

        this.onChange.dispatch(this)
    }

    async disconnect(timeoutMs: number = DEFAULT_TIMEOUT_DISCONNECT): Promise<void> {
        PostCubeLogger.debug(this.tmpl(`Disconnecting from %id_platform%`))

        if (!this.isConnected || this.activeOperations > 0) {
            return
        }

        await withTimeoutRace(async() => {
            await this.device.gatt.disconnect()
        }, timeoutMs, bleErrors.timeout(this.tmpl(`Timed out disconnecting from %id_platform%`)))

        this.onChange.dispatch(this)
    }

    async read(
        serviceUUID: string,
        characteristicUUID: string,
        timeoutMs: number = DEFAULT_TIMEOUT_IO,
    ): Promise<DataView> {
        PostCubeLogger.debug({ serviceUUID, characteristicUUID }, this.tmpl(`Reading value from %id_platform%`))

        return await withTimeoutRace(async() => {
            const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)

            return await characteristic.readValue()
        }, timeoutMs, bleErrors.timeout(this.tmpl(`Timed out reading value from %id_platform%`)))
    }

    async write(
        serviceUUID: string,
        characteristicUUID: string,
        value: DataView,
        timeoutMs: number = DEFAULT_TIMEOUT_IO,
    ): Promise<void> {
        PostCubeLogger.debug({ serviceUUID, characteristicUUID, value }, this.tmpl(`Writing value to PostCube %id_platform%`))

        await withTimeoutRace(async() => {
            const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)

            // TODO: rewrite write
            // await characteristic.writeValueWithResponse(value)
            // await characteristic.writeValueWithoutResponse(value)
            await characteristic.writeValue(value)
        }, timeoutMs, bleErrors.timeout(this.tmpl(`Timed out writing value to %id_platform%`)))
    }

    async startNotifications(
        serviceUUID: string,
        characteristicUUID: string,
        timeoutMs: number = DEFAULT_TIMEOUT_LISTEN,
    ) {
        PostCubeLogger.debug(
            { serviceUUID, characteristicUUID },
            this.tmpl(`Starting to listen for notifications on %id_platform%`),
        )

        await withTimeoutRace(async() => {
            const characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)

            await characteristic.startNotifications()

            this._enabledNotifications[`${serviceUUID}:${characteristicUUID}`] = true
        }, timeoutMs, bleErrors.timeout(this.tmpl(`Timed out starting to listen for notifications on %id_platform%`)))

        PostCubeLogger.info(
            { serviceUUID, characteristicUUID },
            this.tmpl(`Listening for notifications on %id_platform%`),
        )
    }

    async watchNotifications(
        serviceUUID: string,
        characteristicUUID: string,
        listener: Listener<DataView>,
        timeoutMs: number = DEFAULT_TIMEOUT_LISTEN,
    ): Promise<Unwatch> {
        PostCubeLogger.debug(
            { serviceUUID, characteristicUUID },
            this.tmpl(`Watching for notifications on %id_platform%`),
        )

        if (!this._enabledNotifications[`${serviceUUID}:${characteristicUUID}`]) {
            this.startNotifications(serviceUUID, characteristicUUID) // , timeoutMs)
        }

        const handleCharacteristicValueChanged = event => {
            if (typeof listener === 'function') {
                listener(event.target.value)
            }
        }

        let unwatch: Unwatch
        await withTimeoutRace(async() => {
            let characteristic = await this.getCharacteristic(serviceUUID, characteristicUUID)

            await characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged)

            unwatch = async() => {
                await characteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged)

                characteristic = null
                unwatch = null
            }
        }, timeoutMs, bleErrors.timeout(this.tmpl(`Timed out adding value change listener on %id_platform%`)))

        return unwatch
    }
}
