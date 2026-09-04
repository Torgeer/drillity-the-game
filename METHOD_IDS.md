# Canonical method ids — the contract between parallel agents

Several agents are adding these methods at once, in different files. **These ids
are fixed.** Do not invent variants, do not rename, do not alias.

| id | Name | Industry (Talent) | Section mode | Research pack |
|---|---|---|---|---|
| `rc` | Reverse Circulation | Prospecting | `vertical` | `research/02-prospecting.md`, `08-commodities.md` |
| `tunnel-jumbo` | Drill & Blast (face) | Tunneling | `heading` | `research/04-tunnelling.md` |
| `longhole` | Longhole Production | Mining | `vertical` (fan/ring) | `research/03-mining.md` |
| `rockbolt` | Ground Support | Mining / Tunneling | `heading` | `research/03-mining.md`, `04-tunnelling.md` |
| `driven-pile` | Driven Piling | Foundation | `pile` | `research/05-foundation-piling.md` |
| `site-investigation` | Site Investigation | Geotechnical | `vertical` (log) | `research/06-geotech-water-geothermal.md` |

Already in the game: `auger` `cable-tool` `top-hammer` `dth` `overburden` `core`
`rotary-kelly` `cfa` `cased-cfa` `anchor` `hdd` `sonic` `jet-grouting`
`raise-boring` `oil-rotary` — 15. With the six above: **21**.

## Section modes (`geology.js` `profileMode`)
`vertical` (default) · `profile` (HDD, auger boring, microtunnelling — along-bore
distance on X) · `raise` (pilot down, ream up) · `heading` (tunnel/drive face
advancing horizontally) · `pile` (as-built concrete column; for `driven-pile` the
depth ruler BECOMES the blow-count bar chart).

## Rig ids for the new methods (`rigFactory.js`)
`rc-rig` · `tunnel-jumbo` · `longhole-rig` · `bolter` · `piling-leader` ·
`si-rig` — a rig id may equal a method id where the machine is the method.

## Controls — `GAMEDESIGN.md` §7 Advance / Work / Protect
| method | ADVANCE | WORK | PROTECT |
|---|---|---|---|
| `rc` | feed | percussion/rotation | air + **sample integrity** |
| `tunnel-jumbo` | feed | percussion | flushing + **hole accuracy** |
| `longhole` | feed | percussion | flushing + **deviation** |
| `rockbolt` | thrust | rotation | **resin/grout mix + hold time** |
| `driven-pile` | **hammer energy** | **blow rate** | **alignment / rake** |
| `site-investigation` | **push / drop rate** | (SPT: blow count) | **sample quality** |

## What the player is scored on — NOT metres
`rc` sample recovery and contamination · `tunnel-jumbo` pull per round and
overbreak · `longhole` toe accuracy (deviation → dilution) · `rockbolt` install
quality (anchorage, torque test) · `driven-pile` set / blow-count to bearing,
without damaging the pile · `site-investigation` sample quality and log fidelity.
