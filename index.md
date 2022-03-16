---
layout: landing
title: PostCube
---

# PostCube

[PostCube](https://postcube.cz/) je dopravní společnost se sítí boxů pro bezkontaktní doručení a vyzvednutí
balíkových zásilek. Umíme i klasické doručování a vyzvednutí zásilek, takže je možné jak doručení box-box,
tak z adresa-box, box-adresa i z adresy na adresu.

Zde naleznete technické informace, návody a příklady jak PostCube integrovat ve Vašem eshopu či aplikaci pro kurýry. 

# Boxy
Zákazníci PostCube mají boxy pro odeslání a doručení balíků. Majitel boxu nemusí být fyzicky přítomen, kurýr může
schránku otevřít sám.

Samotný box není připojen k internetu, je napájen baterií a lze otevřít výhradně přes Bluetooth protokol. Klíče pro
otevření jsou vždy časově omezené a platné pouze pro danou zásilku. Pouze majitel boxu jej může otevřít kdykoliv.

PostCube spolupracuje s kurýrními společnostmi, aby zajistil doručování zásilek. Nabídne tak zákazníkům vždy
volbu ceny a času přepravy z aktuálně poptané nabídky.

### Eshopy
Eshopy pro integraci potřebují svým zákazníkům nabízet cenu přepravy v daném čase a vzdálenosti a kromě klasické adresy
umět pracovat i s doručením z/do PostCube boxu podle jeho ID.

Pokud Váš eshop běží na platformě [Shoptet](https://www.shoptet.cz),
nainstalujte [doplněk PostCube](https://doplnky.shoptet.cz/postcube) a následujte instrukce.

Připravujeme možnost integrace pro ostatní platformy přes [PostCube HTTP API](https://docs.postcube.cz/docs/api/).

### Kurýrní společnosti a dopravci
Nabídku dopravy integruje PostCube ve svém API jako strana klientská. S dopravcem může být sjednána buď
paušální cena, nebo je možné nabízet cenu dynamicky provoláním API kurýra. Pro danou dvojici adres nabídne PostCube API
svým zákazníkům cenu, kterou uvidí v aplikaci nebo eshopu.

PostCube bude potřebovat pro integraci:
* [API endpoint pro objednání zásilky](https://docs.postcube.cz/docs/kuryri/zasilky.html).
  V ideálním případě HTTP POST s JSON payload.
* Možnost registrovat [Webhook změny stavu zásilky](https://docs.postcube.cz/docs/kuryri/webhook.html) nebo
  dotazovat stav přes API kurýrní společnosti. V ideálním případě webhook HTTP POST s JSON payload.
* V případě dynamických cen
  [API endpoint pro aktuální nabídku dopravy](https://docs.postcube.cz/docs/kuryri/dopravy.html) na základě adres
  vyzvednutí a doručení zásilky.

![Nabídka dopravy](assets/images/nabidka-dopravy.png)

### Vyzvednutí a doručení zásilky kurýrem
Kurýr odbdrží od své společnosti [odkaz pro otevření boxu](https://docs.postcube.cz/docs/kuryri/odkaz.html)
(například v poznámce) nebo [binární klíč](https://docs.postcube.cz/docs/kuryri/klic.html) pro otevření boxu
(přímá interakce s boxy aplikací kurýra).

Stránka z odkazu se spojí přes Bluetooth API s boxem a otevře jej. umí otevřít jak box pro vyzvednutí, tak box
pro doručení zásilky. Ve spolupráci s PostCube ověřte, že kurýři mohou odkaz otevřít a použít ve svém prohlížeči.

Pokud má kurýr v aplikaci přímo integrovaný PostCube, stačí mu k otevření boxu jednorázový binární klíč. Klíče
(pro vyzvednutí a/nebo doručení) generuje PostCube s časovou platností (např. týden) v momentě objednání zásilky
a předá je API kurýrní společnosti. Lze je tedy využít i pro offline otevření mimo signál internetového připojení.

Doručení i vyzvednutí na adrese bez boxu probíhá běžným způsobem. Kurýr má pro komunikaci telefonní číslo adresáta.

Máte-li vlastní webovou aplikaci pro kurýry, můžete použít [PostCube Web SDK](https://docs.postcube.cz/docs/sdk/web.html)
namísto odkazu.

Aplikace na ostatních platformách (například nativní aplikace) mohou pro kurýry implementovat klienta
[PostCube Bluetooth API](https://docs.postcube.cz/docs/bluetooth/). Klíč stačí zapsat do příslušné charakteristiky
Bluetooth služby daného boxu, ostatní části služby kurýr nepotřebuje a ani použít nemůže (nemá privátní klíč pro
zašifrování zprávy).
