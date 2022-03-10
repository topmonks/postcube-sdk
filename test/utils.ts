
export const runVariousEnvironments = (name: string, describeTests: Function) => {
    describe(name, () => {
        describe('Node.js environment:', () => {
            describeTests()
        })

        describe('Web environment:', () => {
            before(async function() {
                this.jsdom = require('jsdom-global')()
                const { Crypto } = await import('@peculiar/webcrypto')
                window.crypto = new Crypto()
            })

            after(async function() {
                this.jsdom()
            })

            describeTests()
        })
    })
}
