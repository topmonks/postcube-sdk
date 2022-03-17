---
title: Nabídka ceny dopravy
slug: dopravy
submenu: kuryri
isMenuItem: true
---

# Nabídka ceny dopravy
Abychom mohli nabídnout našim zákazníkům cenu pro konkrétní zásilku, potřebujeme se s dopravcem/kurýrní společností
na ceně nějak domluvit.

Jakmile bude dopravce nabízet více než jeden druh dopravy (například večerní doručení, express
a podpobně) nebo bude cena jeho dopravy závislá na adrese nebo čase, bude PostCube potřebovat od dopravce endpoint
pro stanovení této ceny. Nejlépe HTTP POST, který přijímá a vrací JSON.

Například:

`HTTP POST https://dopravce-pro-postcube.cz/nabidka/ceny`
```json
{
    "sender": {
        "boxId": 123456,
        "street": "Struhařovská",
        "houseNumber": "2931/9",
        "city": "Praha",
        "country": "CZ",
        "zipCode": "14100"
    },
    "recipient": {
        "street": "Struhařovská",
        "houseNumber": "2931/9",
        "city": "Praha",
        "country": "CZ",
        "zipCode": "14100"
    }
}
```

s očekávanou odpovědí:

```json
[
  {
    "offerUuid": "8fc46c76-4593-4a79-8d8e-8ab32265894a",
    "priceNoVat": "123.45",
    "currency": "CZK",
    "type": "EXPRESS",
    "name": "Expresní doručení",
    "description": "do 30 minut"
  },
  {
    "offerUuid": "da3b6e25-df5d-4cb9-ace0-dd0f606b923b",
    "priceNoVat": "57.00",
    "currency": "CZK",
    "type": "NORMAL",
    "name": "Bežné doručení",
    "description": "do druhého dne"
  }
]
```

Údaj podobný `offerUuid` nebo `type` bychom pak použili při volání
[API pro objednání zásilky](https://docs.postcube.cz/docs/kuryri/zasilky.html).
