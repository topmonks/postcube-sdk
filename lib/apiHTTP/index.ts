
import fetch, { Response } from 'node-fetch'

import { httpErrors } from '../errors'

const POSTCUBE_BASE_URL = 'https://europe-west1-chytrybox.cloudfunctions.net'

const checkResponseStatus = (response: Response) => {
    switch (response.status) {
    case 401:
        throw httpErrors.unauthorized()
    case 403:
        throw httpErrors.forbidden()
    case 500:
        throw httpErrors.serverError()
    }
}

export interface AccessTokenResponse {
    grant_type: 'client_credentials'
    access_token: string
    expires_in: number
}

export const getAccessToken = async(clientId: string, clientSecret: string): Promise<AccessTokenResponse> => {
    const response = await fetch(POSTCUBE_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientSecret }),
    })

    await checkResponseStatus(response)

    if (response.status >= 200 && response.status < 300) {
        return {
            grant_type: 'client_credentials',
            access_token: null,
            expires_in: null,
        }
    }
}
