
import { expect } from 'chai'

import { BleErrorCode } from '../lib/errors'
import {
    getFuture,
    getFutureEpoch,
    parseSecretCode,
    parsePostCubeName,
} from '../lib/helpers'

describe('helpers.ts tests', () => {
    it('should parse secret code (string)', async() => {
        const secretCode = await parseSecretCode('aa100fec')

        expect(secretCode.length).to.equal(4)

        expect(secretCode[0]).to.equal(0xaa)
        expect(secretCode[1]).to.equal(0x10)
        expect(secretCode[2]).to.equal(0x0f)
        expect(secretCode[3]).to.equal(0xec)
    })

    it('should parse secret code (iterable numbers)', async() => {
        const secretCode = await parseSecretCode([ 0x37, 0xb5, 0xca, 0x07 ])

        expect(secretCode.length).to.equal(4)

        expect(secretCode[0]).to.equal(0x37)
        expect(secretCode[1]).to.equal(0xb5)
        expect(secretCode[2]).to.equal(0xca)
        expect(secretCode[3]).to.equal(0x07)
    })

    it('should fail for parse secret code with non-hex string', async() => {
        try {
            await parseSecretCode('az100fec')

            expect(false, 'should have failed, did not').to.be.true
        } catch (err) {
            expect(err?.name).to.equal(BleErrorCode.invalidSecretCode)
        }
    })

    it('should fail for parse secret code with invalid length string', async() => {
        try {
            await parseSecretCode('aa1050fec')

            expect(false, 'should have failed, did not').to.be.true
        } catch (err) {
            expect(err?.name).to.equal(BleErrorCode.invalidSecretCode)
        }
    })

    it('should parse postcube name', async() => {
        const { prefix, id, isDev } = await parsePostCubeName('PostCube 112233')

        expect(prefix).to.equal('PostCube')
        expect(id).to.equal('112233')
        expect(isDev).to.equal(false)
    })

    it('should parse postcube name (devkit)', async() => {
        const { prefix, id, isDev } = await parsePostCubeName('PostCube devkit')

        expect(prefix).to.equal('PostCube')
        expect(id).to.equal('devkit')
        expect(isDev).to.equal(true)
    })

    it('should fail for parse postcube name with missing boxId', async() => {
        try {
            await parsePostCubeName('PostCube')

            expect(false, 'should have failed, did not').to.be.true
        } catch (err) {
            expect(err?.name).to.equal(BleErrorCode.invalidName)
        }
    })

    it('should fail for parse postcube name with invalid prefix', async() => {
        try {
            await parsePostCubeName('PostBox 112233')

            expect(false, 'should have failed, did not').to.be.true
        } catch (err) {
            expect(err?.name).to.equal(BleErrorCode.invalidName)
        }
    })

    it('should fail for parse postcube name with invalid box number (non-`devkit`)', async() => {
        try {
            await parsePostCubeName('PostCube 11aa33')

            expect(false, 'should have failed, did not').to.be.true
        } catch (err) {
            expect(err?.name).to.equal(BleErrorCode.invalidName)
        }
    })

    it('should get 1 hour in the future', async() => {
        const timestamp = new Date()
        timestamp.setHours(timestamp.getHours() + 1)

        const future = await getFuture(1)

        expect(future.getHours()).to.equal(timestamp.getHours())
    })

    it('should get 25 hours in the future', async() => {
        const timestamp = new Date()
        timestamp.setHours(timestamp.getHours() + 25)

        const future = await getFuture(25)

        expect(future.getHours()).to.equal(timestamp.getHours())
    })

    it('should get 1 hour in the future epoch (seconds)', async() => {
        const timestamp = new Date()
        timestamp.setHours(timestamp.getHours() + 1)

        const futureEpoch = await getFutureEpoch(1, false)

        expect(futureEpoch).to.greaterThanOrEqual(timestamp.getTime() / 1000)
    })

    it('should get 1 hour in the future epoch (milliseconds)', async() => {
        const timestamp = new Date()
        timestamp.setHours(timestamp.getHours() + 1)

        const futureEpoch = await getFutureEpoch(1, true)

        expect(futureEpoch).to.greaterThanOrEqual(timestamp.getTime())
    })

    it('should get 25 hour in the future epoch (seconds)', async() => {
        const timestamp = new Date()
        timestamp.setHours(timestamp.getHours() + 25)

        const futureEpoch = await getFutureEpoch(25, false)

        expect(futureEpoch).to.be.greaterThanOrEqual(timestamp.getTime() / 1000)
    })

    it('should get 25 hour in the future epoch (milliseconds)', async() => {
        const timestamp = new Date()
        timestamp.setHours(timestamp.getHours() + 25)

        const futureEpoch = await getFutureEpoch(25, true)

        expect(futureEpoch).to.be.greaterThanOrEqual(timestamp.getTime())
    })
})
