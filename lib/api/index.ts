
export interface AccessTokenResponse {
    grant_type: 'client_credentials'
    access_token: string
    expires_in: number
}

export const getAccessToken = async(): Promise<AccessTokenResponse> => {
    return {
        grant_type: 'client_credentials',
        access_token: null,
        expires_in: null,
    }
}
