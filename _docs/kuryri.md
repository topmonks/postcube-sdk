---
title: Postcube integrace s kurýry
layout: post
---

PostCube od Vás bude potřebovat:
* [API endpoint pro objednání zásilky](/docs/kuryri/zasilky.html).
  V ideálním případě HTTP POST s JSON payload.
* Možnost registrovat [Webhook změny stavu zásilky](/docs/kuryri/webhook.html) nebo
  dotazovat stav přes API kurýrní společnosti. V ideálním případě webhook HTTP POST s JSON payload.
* V případě dynamických cen
  [API endpoint pro aktuální nabídku dopravy](/docs/kuryri/dopravy.html) na základě adres
  vyzvednutí a doručení zásilky.

![Nabídka dopravy](/assets/images/nabidka-dopravy.png)

## Vyzvednutí a doručení zásilky kurýrem
Kurýr odbdrží od své společnosti [odkaz pro otevření boxu](/docs/kuryri/odkaz.html)
(například v poznámce) nebo [binární klíč](/docs/kuryri/klic.html) pro otevření boxu
(přímá interakce s boxy aplikací kurýra).

Stránka z odkazu se spojí přes Bluetooth API s boxem a otevře jej. umí otevřít jak box pro vyzvednutí, tak box
pro doručení zásilky. Ve spolupráci s PostCube ověřte, že kurýři mohou odkaz otevřít a použít ve svém prohlížeči.

Pokud má kurýr v aplikaci přímo integrovaný PostCube, stačí mu k otevření boxu jednorázový binární klíč. Klíče
(pro vyzvednutí a/nebo doručení) generuje PostCube s časovou platností (např. týden) v momentě objednání zásilky
a předá je API kurýrní společnosti. Lze je tedy využít i pro offline otevření mimo signál internetového připojení.

Doručení i vyzvednutí na adrese bez boxu probíhá běžným způsobem. Kurýr má pro komunikaci telefonní číslo adresáta.

Máte-li vlastní webovou aplikaci pro kurýry, můžete použít
[PostCube Web SDK](/docs/sdk/web.html) namísto odkazu.

Aplikace na ostatních platformách (například nativní aplikace) mohou pro kurýry implementovat klienta
[PostCube Bluetooth API](/docs/bluetooth/). Klíč stačí zapsat do příslušné charakteristiky
Bluetooth služby daného boxu, ostatní části služby kurýr nepotřebuje a ani použít nemůže (nemá privátní klíč pro
zašifrování zprávy).


Nabídka ceny dopravy
-------------

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
[API pro objednání zásilky](/docs/kuryri/zasilky.html).


Klíč pro otevření boxu
-------------

Binární klíč pro otevření boxu je sekvence bajtů pro použití v Bluetooth komunikaci s boxem, která otevře box
(při vyzvednutí nebo doručení zásilky).

Týká se případů, kdy není možné nebo preferované v zařízení používaném kurýrem
využít [odkaz pro otevření boxu](/docs/kuryri/odkaz.html).

S klíčem pro daný box a zásilku je možné jej v době platnosti klíče jednorázově otevřít. Bude ale potřeba implementovat
ve Vaší aplikaci
[zápis klíče do Bluetooth charakteristiky boxu](/docs/bluetooth/#otevření-boxu-binárním-klíčem).


Odkaz pro otevření boxu
-------------

Pro otevření boxu stačí znát kód zásilky (například `54RH54`). Malá webová aplikace provede kurýra nalezením boxu
a jeho otevřením:
```
https://app.postcube.cz/messenger/{kód zásilky}
```

Vygenerovaný odkaz pro zásilku je poskytnut spolu s dalšími údaji při založení zásilky.

Odemykací aplikace je [kompatibilní s těmito prohlížeči](https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/requestDevice):
* Chrome 56+,
* Edge 79+,
* Opera 43+,
* Chrome pro Android 56+,
* Opera pro Android 43+,
* Samsung Internet 6.0+.

Kromě výše uvedených je kompatibilní s iPhone.

Z významnějších nebo historických prohlížečů není kompatibilní a nebude fungovat s:
* WebView Android (vestavěný prohlížeč pro Android aplikace),
* Internet Explorer (již delší dobu není podporovaný obecně),
* Mozilla FireFox (desktop i Android).


Webhook stavu zásilky
-------------

Abychom zajistili našim uživatelům komfort při doručování zásilek, i my potřebujeme sledovat jejich stav.

Při integraci dopravce/kurýrní společnosti bývá nejjednoudušší poskytnout Webhook endpoint na straně PostCube API,
a jeho registrace v API kurýra. Tento webhook pak provolá kurýr při změně stavu zásilky
(vyzvednuta, v přepravě, doručena...).

V nejlepším případě pro by to pro nás byl trvale registrovaný webhook HTTP POST endpoint, přijímající JSON, například:
```json
{
  "deliveryId": "eeb8145b-b04b-4189-be7b-4b0525dca691",
  "timestamp": "2022-03-15T08:47:11+00:00",
  "status": "IN_TRANSIT"
}
```

Konkrétní podobu a data bychom si museli spolu dohodnout.

Pokud by webhook nebyl schůdný, alternativou je pravidelné dotazování nějakého API endpointu kurýra s podobnou odpovědí; 
z pohledu vytížení API to ovšem není optimální řešení.


Objednání zásilky
-------------

Při objednání zásilky (kurýra) odešle PostCube na API ednpoint přepravní společnosti data:
* identifikátor zásilky (na straně PostCube)
* adresa pro vyzvednutí (typicky eshop nebo majitel boxu)
* adresa pro doručení (typicky majitel boxu)
* zvolený způsob dopravy (pokud kurýr rozlišuje např. expresní a normální doručení)
  * ID bude předáno tak, jak bylo nabídnuto případným 
    [API endpointem pro aktuální nabídku dopravy](/docs/kuryri/dopravy.html).
* poznámka pro vyzvednutí,
* poznámka pro doručení,
* ID boxu pro vyzvednutí,
* ID boxu pro doručení,
* [odkaz pro otevření boxu](/docs/kuryri/odkaz.html) (jeden odkaz pro případné oba boxy),
* [binární klíč](/docs/kuryri/klic.html) pro otevření boxů (pro každý box zvlášť),
* datum platnosti klíčů a odkazu pro otevření (typicky týden od objednání zásilky)

...a další data dle dohody, včetně odpovědi.

## Pole adresy
Například
```json
{
    "street": "Struhařovská",
    "houseNumber": "2931/9",
    "city": "Praha",
    "country": "CZ",
    "zipCode": "14100"
}
```

