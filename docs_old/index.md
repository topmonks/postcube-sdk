---
layout: default
title: Jak PostCube funguje
---

# PostCube

[PostCube](https://postcube.cz/) je dopravní společnost se sítí boxů pro bezkontaktní doručení a vyzvednutí
balíkových zásilek.

Umíme i klasické doručování a vyzvednutí zásilek, takže je možné jak doručení box-box, tak z adresa-box, box-adresa i
z adresy na adresu.

Zde naleznete technické informace, návody a příklady jak PostCube integrovat ve Vašem eshopu či aplikaci
pro kurýry.

## Jak PostCube funguje?

Zákazníci PostCube mají boxy, do a z nichž je možné doručovat zásilky různé velikosti (podle typu schránky). Podstatné
je, že majitel při vyzvednutí a doručení nemusí být fyzicky přítomen, kurýr může schránku odemknout sám.

Samotný box není připojen k internetu, je napájen baterií a lze odemknout přes Bluetooth protokol. Klíče pro otevření jsou
vždy časově omezené a platné pouze pro danou zásilku. Pouze majitel boxu jej může odemknout kdykoliv.

PostCube spolupracuje s kurýrními společnostmi, aby zajistil doručování zásilek. Nabídne tak zákazníkům vždy
volbu ceny a času přepravy z aktuálně poptané nabídky.


### Objednání zásilky z eshopu
Zákazník eshopu zadá svou adresu. Pokud má PostCube, stačí ID jeho boxu a telefonní číslo
pro ověření zásilky. Cílový box musí být také aktivní a mít volnou kapacitu.

Eshop nabídne uživateli aktuální ceny přepravy (ve variantách, například *Do 90 minut*, *Následující den*).

Při vyřízení objednávky potvrdí eshop zásilku. Kurýr od PostCube obdrží kód a odkaz pro odemknutí boxu
(obou boxů v případě zásilky box-box) a přijede zásilku vyzvednout.

Metody pro ověření boxů, získání cenových nabídek a objednání kurýra integruje eshop s HTTP API PostCube.

Pokud má zákazník PostCube, může sledovat stav zásilky v aplikaci PostCube. Pokud jde o doručení na adresu,
zákazníka notifikuje kurýr běžným způsobem.

### Objednání zásilky majitelem boxu
Majitel vytvoří v aplikaci PostCube zásilku ze svého boxu do jiného boxu nebo na běžnou adresu.
Boxy musí být také aktivní a mít volnou kapacitu.

Podle adresy vyzvednutí a doručení zásilky nabídne aplikace PostCube aktuální
ceny přepravy (ve variantách, například *Do 90 minut*, *Večerní doručení*, *Následující den*).

Odesílatel označí balík kódem, vloží balík do boxu a z aplikace potvrdí zásilku. Kurýr od PostCube obdrží kód a odkaz
pro odemknutí boxu (obou boxů v případě zásilky box-box) a přijede zásilku vyzvednout.

### Vyzvednutí a doručení zásilky v boxu
Kurýr má k dispozici jednorázový odkaz pro odemčení boxu a kód zásilky pro odemčení boxu. Kód umožňuje odemknout
box i bez aktivního internetového připojení přes protokol Bluetooth. Odkaz vede na stránku, která komunikaci Bluetooth
zařídí a box odemkne (v podporovaných prohlížečích).

### Vyzvednutí a doručení zásilky na adrese
Doručení i vyzvednutí na adrese bez boxu probíhá běžným způsobem. Kurýr má pro komunikaci telefonní číslo adresáta.

## Kurýři
Kurýrní společnosti pro integraci potřebují svým kurýrům umožnit odemknout box odkazem PostCube nebo kódem zásilky
přímo přes Bluetooth.

### Odemknutí PostCube odkazem
Poskytněte kurýrovi k zásilce [odkaz pro odemčení boxu](https://docs.postcube.cz/docs/sdk/odkaz.html), například
v poznámce. Ve spolupráci s PostCube ověřte, že kurýři mohou tento odkaz otevřít a použít ve svém prohlížeči.

Máte-li vlastní webovou aplikaci pro kurýry, můžete použít [PostCube Web SDK](https://docs.postcube.cz/docs/sdk/web.html)
namísto odkazu.

Aplikace na ostatní platformy (nativní aplikace) mohou pro kurýry implementovat klienta
[PostCube Bluetooth API](https://docs.postcube.cz/docs/api/bluetooth.html).

### Spolupráce s PostCube
*TBD*

PostCube bude potřebovat pro integraci API endpoint pro objednání zásilky. V ideálním případě HTTP POST s JSON payload.

V případě dynamických cen dopravy poskytněte PostCube API endpoint pro aktuální nabídku na základě adres
vyzvednutí a doručení zásilky.



## Eshopy
Eshopy pro integraci potřebují svým zákazníkům nabízet cenu přepravy v daném čase a vzdálenosti a kromě klasické adresy
umět pracovat i s doručením z/do PostCube boxu podle jeho ID.

### Spolupráce s PostCube
*TBD*

### Integrace na webu eshopu
*TBD*

### Shoptet integrace
Pokud Váš eshop běží na platformě [Shoptet](https://www.shoptet.cz),
nainstalujte [doplněk PostCube](https://doplnky.shoptet.cz/postcube?_fid=sfnj) a následujte instrukce.
