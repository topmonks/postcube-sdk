
# API Docs

baseUrl: `https://europe-west1-chytrybox.cloudfunctions.net`

## OAuth

`POST {baseUrl}/oauth-login`

### Request
```json
{
    "grant_type": "client_credentials",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
}
```

### Response
```json
{
    "grant_type": "client_credentials",
    "expires_in": 0,
    "access_token": "string"
}
```
