---
title: Webhook stavu zásilky
slug: webhook
submenu: kuryri
isMenuItem: true
---

# Webhook stavu zásilky
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
