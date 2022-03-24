---
title: Postcube integrace s kurýry
slug: kuryri
isSubmenu: true
---

# Integrace PostCube s kurýry
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
