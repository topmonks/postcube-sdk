---
layout: landing
title: PostCube
---

# PostCube
[PostCube](https://postcube.cz/) je dopravní společnost se sítí boxů pro bezkontaktní doručení a vyzvednutí
balíkových zásilek. Umíme i klasické doručování a vyzvednutí zásilek, takže je možné jak doručení box-box,
tak adresa-box, box-adresa i z adresy na adresu.

PostCube spolupracuje s kurýrními společnostmi. Nabídne tak zákazníkům vždy volbu ceny a času přepravy z aktuálně
poptané nabídky.

Zde naleznete technické informace, návody a příklady jak PostCube integrovat ve Vašem eshopu či aplikaci pro kurýry. 

## Boxy
Zákazníci PostCube mají boxy pro odeslání a doručení balíků. Majitel boxu nemusí být fyzicky přítomen, kurýr může
schránku otevřít sám.

Samotný box není připojen k internetu, je napájen baterií a lze otevřít výhradně přes Bluetooth protokol. Klíče pro
otevření jsou vždy časově omezené a platné pouze pro danou zásilku. Jen majitelé boxu jej mohou otevřít kdykoliv.

## Eshopy
Eshopy pro integraci potřebují svým zákazníkům nabízet cenu přepravy v daném čase a vzdálenosti a kromě klasické adresy
umět pracovat i s doručením z/do PostCube boxu podle jeho ID.

Pokud Váš eshop běží na platformě [Shoptet](https://www.shoptet.cz),
nainstalujte [doplněk PostCube](https://doplnky.shoptet.cz/postcube) a následujte instrukce.

Připravujeme možnost integrace pro ostatní platformy přes [PostCube HTTP API](https://docs.postcube.cz/docs/api/).

## Kurýrní společnosti a dopravci
Nabídku dopravy integruje PostCube ve svém API jako strana klientská. Zde je
[specifikace](https://docs.postcube.cz/docs/kuryri/) všeho, co od Vás budeme pro spolupráci technicky potřebovat.

S dopravcem může být sjednána buď paušální cena, nebo je možné nabízet cenu dynamicky provoláním API kurýra.
Pro danou dvojici adres nabídne PostCube API svým zákazníkům cenu, kterou uvidí v aplikaci nebo eshopu.

PostCube umožňuje kurýrům otevřít boxy k zásilce a to buď [odkazem](https://docs.postcube.cz/docs/kuryri/odkaz.html),
nebo [binárním klíčem](https://docs.postcube.cz/docs/kuryri/klic.html). Záleží na tom, zda kurýr má k dispozici pouze
prohlížeč v mobilu, nebo (nativní či webovou) aplikaci společnosti pro kterou doručuje.

