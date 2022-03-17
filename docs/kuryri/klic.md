---
title: Klíč pro otevření boxu
slug: klic
submenu: kuryri
isMenuItem: true
---

# Klíč pro otevření boxu
Binární klíč pro otevření boxu je sekvence bajtů pro použití v Bluetooth komunikaci s boxem, která otevře box
(při vyzvednutí nebo doručení zásilky).

Týká se případů, kdy není možné nebo preferované v zařízení používaném kurýrem
využít [odkaz pro otevření boxu](https://docs.postcube.cz/docs/kuryri/odkaz.html).

S klíčem pro daný box a zásilku je možné jej v době platnosti klíče jednorázově otevřít. Bude ale potřeba implementovat
ve Vaší aplikaci
[zápis klíče do Bluetooth charakteristiky boxu](https://docs.postcube.cz/docs/bluetooth/#otevření-boxu-binárním-klíčem).
