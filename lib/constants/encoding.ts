
import * as asn from 'asn1.js'

export interface ASN<Value> {
    decode(buffer: Buffer, typeOrFormatOrWhatever: 'der'|string): Value
    encode(value: Value): Buffer
}

export interface Rfc5915Key {
    version: number
    privateKey: Buffer
    publicKey: {
        unused: number
        data: Buffer
    }
}

export interface Pkcs8Key {
    version: number
    privateKey: Buffer
    algorithmIdentifier: {
        privateKeyType: 'EC'|string
        parameters: 'prime256v1'|string
    }
}

export const rfc5915KeyAsn: ASN<Rfc5915Key> = asn.define('Rfc5915Key', function() {
    this.seq().obj(
        this.key('version').int(),
        this.key('privateKey').octstr(),
        this.key('parameters').optional().explicit(0).objid({
            '1 2 840 10045 3 1 7': 'prime256v1',
            '1 3 132 0 10': 'secp256k1',
            '1 3 132 0 34': 'secp384r1',
            '1 3 132 0 35': 'secp521r1'
        }),
        this.key('publicKey').optional().explicit(1).bitstr(),
    )
})

export const pkcs8KeyAsn: ASN<Pkcs8Key> = asn.define('Pkcs8Key', function() {
    this.seq().obj(
        this.key('version').int(),
        this.key('algorithmIdentifier').seq().obj(
            this.key('privateKeyType').objid({
                '1 2 840 10045 2 1': 'EC',
            }),
            this.key('parameters').objid({
                '1 2 840 10045 3 1 7': 'prime256v1',
                '1 3 132 0 10': 'secp256k1',
                '1 3 132 0 34': 'secp384r1',
                '1 3 132 0 35': 'secp521r1',
            }),
        ),
        this.key('privateKey').octstr(),
    )
})
