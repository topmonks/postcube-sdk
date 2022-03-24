
import { runVariousEnvironments } from '../utils'

import { runCommandTests } from './command'
import { runEncryptionTests } from './encryption'
import { runHashTests } from './hash'
import { runEncodingTests } from './index'

describe('Binary command encoding tests', () => {

    runVariousEnvironments('encoding/command.ts tests', runCommandTests)

    runVariousEnvironments('encoding/encryption.ts tests', runEncryptionTests)

    runVariousEnvironments('encoding/hash.ts tests', runHashTests)

    runVariousEnvironments('encoding/index.ts tests', runEncodingTests)

})
