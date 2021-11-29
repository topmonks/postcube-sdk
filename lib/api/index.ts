
import fetch from 'node-fetch'

import { apiErrors } from '../errors'

const POSTCUBE_BASE_URL = 'https://europe-west1-chytrybox.cloudfunctions.net'

export interface AccessTokenResponse {
    grant_type: 'client_credentials'
    access_token: string
    expires_in: number
}

export const getAccessToken = async(clientId: string, clientSecret: string): Promise<AccessTokenResponse> => {
    const response = await fetch(POSTCUBE_BASE_URL, {
        method: 'POST',
    })

    if (response.status >= 200 && response.status < 300) {
    }



    return {
        grant_type: 'client_credentials',
        access_token: null,
        expires_in: null,
    }
}
