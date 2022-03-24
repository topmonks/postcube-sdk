
import { expect } from 'chai'

import { expectedHashMap } from '../data'
import { hashSHA256 } from '../../lib/encoding/hash'

export const runHashTests = () => {
    it('should hash with SHA256', async() => {
        const { inputNumberArray, outputHex, outputNumberArray } = expectedHashMap.alpha

        const hashed = await hashSHA256(inputNumberArray)
        const hashedHex = Buffer.from(hashed).toString('hex')

        expect(hashedHex).to.equal(outputHex)

        for (const index in hashed) {
            expect(hashed[index]).to.equal(outputNumberArray[index])
        }
    })

    it(`hashSHA256(data: Iterable<number>) - should accept number array`, async() => {
        const { inputNumberArray, outputHex, outputNumberArray } = expectedHashMap.beta

        const hashed = await hashSHA256(inputNumberArray)
        const hashedHex = Buffer.from(hashed).toString('hex')

        expect(hashedHex).to.equal(outputHex)

        for (const index in hashed) {
            expect(hashed[index]).to.equal(outputNumberArray[index])
        }
    })

    it(`hashSHA256(data: Iterable<number>) - should accept Buffer`, async() => {
        const { inputNumberArray, outputHex, outputNumberArray } = expectedHashMap.beta

        const hashed = await hashSHA256(Buffer.from(inputNumberArray))
        const hashedHex = Buffer.from(hashed).toString('hex')

        expect(hashedHex).to.equal(outputHex)

        for (const index in hashed) {
            expect(hashed[index]).to.equal(outputNumberArray[index])
        }
    })

    it(`hashSHA256(data: Iterable<number>) - should accept Uint8Array`, async() => {
        const { inputNumberArray, outputHex, outputNumberArray } = expectedHashMap.beta

        const hashed = await hashSHA256(new Uint8Array(inputNumberArray))
        const hashedHex = Buffer.from(hashed).toString('hex')

        expect(hashedHex).to.equal(outputHex)

        for (const index in hashed) {
            expect(hashed[index]).to.equal(outputNumberArray[index])
        }
    })
}
