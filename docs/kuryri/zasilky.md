---
title: Objednání zásilky
slug: zasilky
submenu: kuryri
isMenuItem: true
---

# Objednání zásilky
Při objednání zásilky (kurýra) odešle PostCube na API ednpoint přepravní společnosti data:
* adresa pro vyzvednutí (typicky eshop nebo majitel boxu)
* adresa pro doručení (typicky majitel boxu)
* zvolený způsob dopravy (pokud kurýr rozlišuje např. expresní a normální doručení)
  * ID bude předáno tak, jak bylo nabídnuto případným 
    [API endpointem pro aktuální nabídku dopravy](https://docs.postcube.cz/docs/kuryri/dopravy.html).
* poznámka pro vyzvednutí,
* poznámka pro doručení,
* ID boxu pro vyzvednutí,
* ID boxu pro doručení,
* [odkaz pro otevření boxu](https://docs.postcube.cz/docs/kuryri/odkaz.html) (jeden odkaz pro případné oba boxy),
* [binární klíč](https://docs.postcube.cz/docs/kuryri/klic.html) pro otevření boxů (pro každý box zvlášť),
* datum platnosti klíčů a odkazu pro otevření (typicky týden od objednání zásilky),

...a další data dle dohody.

## Pole adresy
Například
```
{
    street: 'Struhařovská',
    houseNumber: '2931/9',
    city: 'Praha',
    country: 'CZ',
    zipCode: '14100'
}
```
