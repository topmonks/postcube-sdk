
import { runVariousEnvironments } from '../utils'

import { runApiBLETests } from './ble'
import { runApiBLEPostcubeTests } from './postcube'

describe('API BLE tests', () => {

    describe('apiBLE/ble.ts tests', () => {
        runApiBLETests()
    })

    describe('apiBLE/postcube.ts tests', () => {
        runApiBLEPostcubeTests()
    })

})
