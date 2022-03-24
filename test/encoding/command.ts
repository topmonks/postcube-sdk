
import { expect } from 'chai'

import { generateCommandId } from '../../lib/encoding/command'
import { COMMAND_ID_SIZE } from '../../lib/constants/bluetooth'

export const runCommandTests = () => {
    it('should generate commandId', async() => {
        const commandId = await generateCommandId()

        expect(typeof commandId).to.equal('number')
        expect(commandId).to.be.greaterThan(0)
        expect(commandId).to.be.lessThan(Math.pow(2, COMMAND_ID_SIZE * 8) - 1)
    })

    it('should generate different commandId every time', async() => {
        const commandIds = []

        for (let index = 0; index < 100; index++) {
            const commandId = await generateCommandId()

            expect(commandIds.indexOf(commandId)).to.equal(-1, 'same commandId has already been generated before')

            commandIds.push(commandId)
        }
    })
}
