<p align="center"><img src="https://raw.githubusercontent.com/rest2178/smart-graph-button-card/main/images/icon-256.png" alt="Smart Graph Button Card" width="128" height="128"></p>

# Smart Graph Button Card

Eine kompakte, frei parametrierbare **Button-Karte für Home Assistant** mit Symbol, Bezeichnung, bis zu zwei Werten und einem **integrierten Verlaufsgraphen**. Alles ist selbst implementiert: der SVG-Graph, das Laden der History-Daten, die Aktionen und der visuelle Editor.

- **Keine Abhängigkeiten** zu anderen Custom Cards (kein button-card, ApexCharts, mini-graph-card, card-mod, Mushroom …)
- **Keine externen Ressourcen**: keine CDNs, keine Webfonts, keine nachgeladenen Skripte oder Stylesheets
- **Eine einzige Datei**: `smart-graph-button-card.js` (ES-Modul)

```
┌──────────────────────────────────────────┐
│ ▂▃▅▇█▇▅▃  (●)  Schreibtisch 1            │
│ ▂▃▅▇█▇▅▃       Ein · 7,50 W              │
└──────────────────────────────────────────┘
```

## Vier Kartentypen

| Typ | Zweck |
| --- | --- |
| `custom:smart-graph-button-card` | Schaltbare Button-Karte: Symbol, Name, zwei Werte, Graph, Aktionen |
| `custom:smart-graph-info-card` | Reine Info-Karte für Messwerte (Temperatur, Luftfeuchtigkeit …): kleines Symbol und Name oben, großer Wert, Verlauf unten. Gleiche Höhe wie der Button, bis zu 4 nebeneinander. Mit `design: tile | ring | compact` als moderne Kachel mit Zustandstext |
| `custom:smart-graph-overview-card` | Mehrere Sensoren in einer Karte (z. B. Luftqualität): Gesamtbewertung, alle Werte, umschaltbarer Verlauf |
| `custom:smart-graph-media-card` | Media-Player steuern (Alexa, Sonos, Google Cast, Spotify …): Ein/Aus, Lautstärke, Zurück/Wiedergabe/Weiter und Sender-Tasten |
| `custom:smart-graph-weather-badge` | **Badge** (Dashboard-Badges, 36 px hoch) für das Wetter im Stil der Info-Karte: Symbol, Temperatur, Zustand, Vorhersage-Verlauf |

Alle stecken in derselben Datei. Es ist nur **eine** Lovelace-Ressource nötig.

## Inhalt

1. [Screenshots](#screenshots)
2. [Funktionen](#funktionen)
3. [Installation über HACS](#installation-über-hacs-benutzerdefiniertes-repository)
4. [Manuelle Installation](#manuelle-installation)
5. [Lovelace-Ressource](#lovelace-ressource)
6. [Minimale Konfiguration](#minimale-konfiguration)
7. [Konfigurationsreferenz und Standardwerte](#konfigurationsreferenz)
8. [Grapharten](#grapharten)
9. [Graphpositionen](#graphpositionen)
10. [Farbmodi](#farbmodi)
11. [Ebenen](#ebenen)
12. [Beispiele](#beispiele)
13. [History-Abfrage](#history-abfrage)
14. [Performance](#performance)
15. [Fehlerbehandlung](#fehlerbehandlung)
16. [Kompatibilität](#kompatibilität)
17. [Entwicklung, Build und Tests](#entwicklung-build-und-tests)
18. [Bekannte Einschränkungen](#bekannte-einschränkungen)
19. [Lizenz](#lizenz)

## Screenshots

| Ansicht | Datei |
| --- | --- |
| Balkengraph links mit Grenzwertfarben | `docs/screenshots/basic.png` |
| Flächengraph über die ganze Karte | `docs/screenshots/full-background.png` |
| Statushintergrund und Graph | `docs/screenshots/state-background.png` |
| Grenzwertfarben auf Symbol, Graph und Hintergrund | `docs/screenshots/thresholds.png` |
| Dunkles Theme | `docs/screenshots/dark.png` |

> Die Pfade sind Platzhalter. Lege eigene Screenshots unter `docs/screenshots/` ab.

## Funktionen

- Symbol (MDI über `ha-icon`), natives Zustandssymbol (`ha-state-icon`), `entity_picture`, lokales Bild (`/local/…`), Bild-URL, bereinigtes Inline-SVG oder gar kein Symbol
- Symbolhintergrund in den Formen `circle`, `rounded-square`, `square` oder `none`, Farben je Zustand, CSS-Animationen (`pulse`, `rotate`, `blink`); bei `prefers-reduced-motion` sind sie aus
- Name aus der Konfiguration, aus `friendly_name`, aus einem Attribut oder aus einem sicheren Template
- Zwei Werte, nebeneinander (`inline`) oder untereinander (`stacked`): State, Attribut, Text, Name, `last_changed`, `last_updated`, Template, Formatierungsfunktionen
- Graph mit `line`, `area`, `smooth-area`, `bar`, `column`, `stepped`, `line-bar`, `smooth-line-bar` in nativem SVG
- Graphpositionen `full`, `after-icon`, `left`, `right`, `bottom`, `icon-area`, `custom`
- Farbmodi `fixed`, `state`, `thresholds` (beliebig viele Grenzwerte, `current` oder `per-point`), `gradient`, `sign` (über/unter null)
- Info-Karte als moderne Kachel, mit Zustandsring oder als kompakte Statuskachel; Zustandstexte wie „Optimal“ oder „Zu warm“ mit Vorgaben je Sensortyp
- Übersichtskarte für mehrere Sensoren mit Gesamtbewertung und umschaltbarem Verlauf
- Fünf fertige Designs (`design: subtle | split | badge | sparkline | panel`) mit großem Wert rechts, Statuspunkt und Akzentfarbe
- Statusabhängiger Kartenhintergrund, Lesbarkeits-Overlay, Ebenenreihenfolge einstellbar
- Automatisch lesbare Schriftfarben im Hell- und Dunkelmodus (Kontrastprüfung, Farbton bleibt erhalten)
- Eigene Zustandsregeln mit `==`, `!=`, `>`, `>=`, `<`, `<=`, `contains`, `regex`
- Aktionen für Tap, Hold und Double-Tap; Maus, Touch und Tastatur werden unterstützt
- Visueller Editor auf Basis des nativen `ha-form`, mit Farbwähler (Maus oder Texteingabe) und Grenzwertliste
- Barrierefreiheit: `role="button"`, `tabindex="0"`, aussagekräftiges `aria-label`, sichtbarer Fokus, Unavailable-Badge (der Zustand wird nicht nur über Farbe vermittelt)

## Installation über HACS (benutzerdefiniertes Repository)

1. HACS öffnen → oben rechts **⋮** → **Benutzerdefinierte Repositories**.
2. Repository-URL eintragen, z. B. `https://github.com/rest2178/smart-graph-button-card`.
3. Als Typ **Dashboard** wählen. In älteren HACS-Versionen heißt der Typ „Lovelace“ oder „Plugin“.
4. **Smart Graph Button Card** suchen, **Herunterladen** wählen und den Browser neu laden (Cache leeren).

HACS legt die Lovelace-Ressource normalerweise selbst an. Falls nicht: siehe [Lovelace-Ressource](#lovelace-ressource).

> Der Typ (Dashboard/Plugin) wird beim Hinzufügen in HACS gewählt, nicht in `hacs.json`. Die `hacs.json` legt Name, Dateiname, README-Darstellung und Mindestversion fest.

Es müssen **keine weiteren** HACS-Erweiterungen installiert werden.

## Manuelle Installation

1. `dist/smart-graph-button-card.js` herunterladen (aus einem Release oder aus dem Repository).
2. Die Datei nach `<config>/www/smart-graph-button-card/smart-graph-button-card.js` kopieren.
3. Die Ressource `/local/smart-graph-button-card/smart-graph-button-card.js` als **JavaScript-Modul** hinzufügen.

## Lovelace-Ressource

**Einstellungen → Dashboards → ⋮ → Ressourcen → Ressource hinzufügen**

| Installation | URL | Typ |
| --- | --- | --- |
| HACS | `/hacsfiles/smart-graph-button-card/smart-graph-button-card.js` | JavaScript-Modul |
| Manuell | `/local/smart-graph-button-card/smart-graph-button-card.js` | JavaScript-Modul |

YAML-Modus:

```yaml
lovelace:
  resources:
    - url: /hacsfiles/smart-graph-button-card/smart-graph-button-card.js
      type: module
```

## Info-Karte

```yaml
type: custom:smart-graph-info-card
entity: sensor.wohnzimmer_temperatur
name: Temperatur
icon: mdi:thermometer
```

```
┌──────────────────┐
│ 🌡 Temperatur     │
│ 28,1 °C          │
│ ╭─╮_╭──╮_╭╮__╭─  │  ← Verlauf, Fläche blendet nach unten aus
└──────────────────┘
```

Die Info-Karte nutzt alle Optionen der Button-Karte, hat aber eigene Standardwerte:

| Option | Standard bei der Info-Karte |
| --- | --- |
| `value_1` | `{type: state}` – der Zustand des Entitys, groß dargestellt, mit kleiner Einheit |
| `graph` | aktiv, Entity = Haupt-Entity, `type: smooth-area`, `position: bottom`, `height: 40%`, `baseline: bottom`, `line_width: 1.5`, `fill_opacity: 0.35` |
| `graph.color` | `auto`: Farbe nach Sensortyp (Temperatur rot, Feuchtigkeit grün, Leistung/Energie orange, CO₂ lila, Druck/Wind türkis, Niederschlag blau, sonst Theme-Farbe) |
| `icon_area` | ohne Hintergrund, 18 px, Symbolfarbe `--secondary-text-color` |
| `tap_action` / `hold_action` | `more-info` / `none` |
| `layout` | Höhe 64 px wie der Button, `padding: 8px 10px`, keine Mindestbreite |

**Position des Werts** (`value_position`, im Editor „Position des Werts“):

| Wert | Lage |
| --- | --- |
| `top-left` (Standard), `top-center`, `top-right` | direkt unter dem Namen: links, mittig oder rechts |
| `middle-left`, `middle-center`, `middle-right` | vertikal mittig im freien Bereich unter dem Namen |
| `bottom-left`, `bottom-center`, `bottom-right` | am unteren Rand |
| `name-right` | in der Kopfzeile rechts neben dem Namen; darunter bleibt mehr Platz für den Graphen |

Bei der Standardhöhe von 64 px füllen Name und großer Wert die Karte fast aus. „Oben“, „Mitte“ und „unten“ unterscheiden sich daher erst bei höheren Karten (z. B. `layout: { height: 90px }`) deutlich, oder wenn Name und Symbol ausgeblendet sind (`show_name: false`, `icon_area: false`). Zusätzlich lässt sich der Wert mit `value_offset` frei verschieben, im Editor mit zwei Schiebereglern:

```yaml
value_position: top-right
value_offset:
  x: -4    # px, negativ = nach links
  y: 6     # px, positiv = nach unten
```

**Position des Symbols** (`icon_position`, im Editor „Position des Symbols“):

| Wert | Lage |
| --- | --- |
| `name-left` (Standard) | in der Kopfzeile vor dem Namen |
| `name-right` | in der Kopfzeile rechts (hinter Name bzw. Wert) |
| `top-left`, `top-center`, `top-right` | frei in der Karte oben; bei links/rechts hält der Name Abstand zum Symbol |
| `middle-left`, `middle-center`, `middle-right` | vertikal mittig |
| `bottom-left`, `bottom-center`, `bottom-right` | am unteren Rand |

Feinverschiebung mit `icon_offset` (x/y in px), im Editor mit zwei Schiebereglern. Die Größe des Symbols steuern `icon_area.icon_size` und `icon_area.size`:

```yaml
icon_position: top-right
icon_offset: { x: 2, y: -2 }
icon_area:
  size: 26px
  icon_size: 24px
```

Die Schriftgrößen von Name und Wert wachsen mit der Kartenbreite (maximal 24 px für den Wert). Dadurch passen auch auf dem Handy 4 Karten nebeneinander. Mit `value_1.font_size` und `name_style.font_size` lassen sich feste Größen setzen. In Sections-Dashboards belegt die Info-Karte standardmäßig 3 von 12 Spalten, also 4 pro Zeile. Ein Beispiel mit 4 Karten in einem `horizontal-stack` steht in [`examples/info-cards.yaml`](examples/info-cards.yaml).

Mit `variant: info` lässt sich die Info-Darstellung auch für `custom:smart-graph-button-card` einschalten. Im Editor heißt das „Darstellung → Info-Karte“.

## Designs

Für die Button-Karte gibt es fünf fertige Designs. Sie sind für einen Schalter mit Leistungsmesser gedacht: Die Haupt-Entity ist der Schalter (Tippen schaltet), der Graph zeigt den Sensor.

```yaml
type: custom:smart-graph-button-card
entity: switch.schreibtisch_1
icon: mdi:desk
design: subtle            # standard | subtle | split | badge | sparkline | panel
# design_size: double     # optional: doppelt so hoch (128 px) mit größerem Symbol und Text
graph:
  entity: sensor.schreibtisch_1_leistung
```

| `design` | Aussehen |
|---|---|
| `subtle` | **Dezenter Graph im Hintergrund:** Symbol, Name, „● Ein · 9 W“, rechts groß „9 W / aktuell“. Der Graph liegt unten hinter dem Inhalt, die Karte ist im Zustand „Ein“ leicht eingefärbt |
| `split` | **Zwei Bereiche:** oben der Inhalt mit „● Ein · seit 08:14 Uhr“ und dem großen Wert, darunter eine feine Linie und der Graph in einem eigenen Bereich |
| `badge` | **Farbiger Status:** wie `subtle`, der große Wert steht in einem farbigen Feld |
| `sparkline` | **Minimalistisch:** links Symbol, Name, „● Ein“ und „9 W aktuell“, rechts nach einer senkrechten Linie ein kleiner Graph |
| `panel` | **Akzentleiste mit Wertfeld:** links eine farbige Leiste (grün bei „Ein“, grau bei „Aus“), Symbol in einer abgerundeten Kachel, Name und „● Ein“, in der Mitte ein schlanker Linien-Graph, rechts der Wert „11 W“ in einem leicht eingefärbten Feld. Ein langer Name läuft in den Graphen hinein; der Graph wird hinter der Schrift durchscheinend |
| `standard` | bisheriges Aussehen (Standard) |

Alle Designs haben die normale Button-Höhe (64 px), so passen sie zu den übrigen Karten. Mit `design_size: double` werden sie doppelt so hoch (128 px), mit größerem Symbol, größerer Schrift und mehr Platz für den Graphen. Im Editor heißt der Schalter „Doppelte Höhe“. In der normalen Höhe liegt der Graph bei `split` in einem schmalen Streifen unter der Linie, und die Beschriftung „aktuell“ entfällt dort aus Platzgründen.

Ein Design setzt nur Standardwerte. Alles lässt sich wie gewohnt überschreiben, z. B. `layout.height`, `graph.type`, `value_2` oder `name_style`. Im Editor steht die Auswahl unter „Design“. Beim Wechsel des Designs werden Graph-Typ, Position und Höhe auf die Werte des neuen Designs zurückgesetzt.

**Großer Wert (`hero`)**: zeigt standardmäßig den Zustand der Graph-Entity, darunter die Beschriftung „aktuell“. Er funktioniert auch ohne Design.

```yaml
hero:
  caption: jetzt          # Beschriftung, "" = keine
  style: badge            # text | badge | box (leicht eingefärbtes Feld)
  # wie value_1/value_2: entity, attribute, decimals, unit, thresholds, color, font_size …
# hero: false             # ausblenden
```

**Akzentfarbe (`accent_color`)**: Farbe des Statuspunkts, des großen Werts, des Graphen und der Einfärbung, je Zustand:

```yaml
accent_color:
  on: "#22c55e"
  off: var(--secondary-text-color)
```

Der Statuspunkt vor dem ersten Wert wird mit `values.status_dot: true` eingeschaltet; bei den Designs ist er an. Mit `graph.headroom` (Anteil, Standard `0.05`, bei den Designs `0.15` bis `0.45`) bleibt über dem höchsten Wert Luft, damit der Graph nicht bis an den Text reicht.

## Info-Karte: Designs

Für die Info-Karte gibt es drei Designs (doppelte Button-Höhe, 128 px). Symbol, Farbe und Zustandstext ergeben sich aus dem Sensortyp (`device_class`), es reicht also die Entity:

```yaml
type: custom:smart-graph-info-card
entity: sensor.wohnzimmer_temperatur
design: tile        # standard | tile | ring | compact
```

| `design` | Aussehen |
|---|---|
| `tile` | **Moderne Mini-Kachel:** Symbol im farbigen Kreis, Name, Zustand („● Eher kühl“), großer Wert, Verlauf unten; Kachel in der Farbe des Sensortyps leicht eingefärbt |
| `ring` | **Kachel mit Zustandsring:** Symbol in einem Ring, der sich mit dem Wert füllt, daneben Name und Wert, Verlauf unten |
| `compact` | **Kompakte Statuskachel:** alles zentriert – Symbol, Wert, Zustand („● Optimal“), kleiner Verlauf. Hintergrund, Symbol und Graph wechseln die Farbe mit dem Zustand (blau/grün/orange/rot). Ohne Namen (`show_name: true` blendet ihn ein) |

**Farben je Sensortyp:** Temperatur orange, Luftfeuchtigkeit blau, CO₂ grün, Feinstaub violett, VOC türkis … Eigene Farbe: `accent_color: "#0ea5e9"`. `accent_color: level` färbt nach dem Zustand (Standard bei `compact`).

**Zustände (`levels`)** – Vorgaben (jeweils „ab Wert“):

| Sensortyp | Stufen |
|---|---|
| Temperatur | Zu kalt · ab 15 Eher kühl · ab 19 Optimal · ab 24 Eher warm · ab 26 Zu warm |
| Luftfeuchtigkeit | Zu trocken · ab 30 Eher trocken · ab 40 Optimal · ab 60 Eher feucht · ab 70 Zu feucht |
| CO₂ | Gut · ab 800 Erhöht · ab 1400 Kritisch |
| Feinstaub PM2.5 | Sehr gut · ab 5 Gut · ab 15 Erhöht · ab 25 Schlecht · ab 50 Sehr schlecht |
| Feinstaub PM10 | Sehr gut · ab 15 Gut · ab 45 Erhöht · ab 75 Schlecht |
| VOC | Gut · ab 300 Erhöht · ab 1000 Schlecht |

Eigene Stufen (die erste ohne `value` gilt für alles darunter, `icon` ersetzt den Punkt):

```yaml
levels:
  - label: Zu kalt
    color: "#3b82f6"
    icon: mdi:snowflake
  - value: 19
    label: Optimal
    color: "#22c55e"
  - value: 25
    label: Zu warm
    color: "#ef4444"
# levels: false        # keinen Zustand anzeigen
# levels: humidity     # Vorgabe eines anderen Sensortyps verwenden
```

**Ring:** Der Bereich des Rings kommt aus dem Sensortyp (Temperatur 0–40, Luftfeuchtigkeit 0–100, CO₂ 400–2000, PM2.5 0–75). Eigener Bereich: `ring: { min: 10, max: 30 }`.

Im Editor: „Design“ und „Zustand anzeigen“. Höhe, Graph, Farben und Schriftgrößen lassen sich wie gewohnt überschreiben.

## Übersichtskarte (mehrere Sensoren)

```yaml
type: custom:smart-graph-overview-card
title: Luftqualität
entities:
  - sensor.wohnzimmer_temperatur
  - sensor.wohnzimmer_luftfeuchtigkeit
  - entity: sensor.wohnzimmer_co2
    name: CO₂               # optional: name, icon, color, unit, decimals, levels
  - sensor.wohnzimmer_pm25
graph_entity: sensor.wohnzimmer_co2   # zu Beginn gezeigter Verlauf (Standard: erster Sensor)
hours_to_show: 24
```

- **Links:** Gesamtbewertung nach dem schlechtesten Sensor – „Gut / Angenehme Raumluft“, „Mäßig / Lüften empfohlen“ oder „Schlecht / Bitte lüften“. Leichte Abweichungen wie „Eher kühl“ zählen als gut.
- **Rechts:** alle Werte mit Symbol in der Farbe des Sensortyps. Antippen öffnet die Detailansicht.
- **Unten:** Verlauf mit Zeitachse; mit den Schaltflächen wird zwischen den Sensoren gewechselt.
- Auf schmalen Bildschirmen rutschen die Werte unter die Bewertung.

| Option | Standard | Beschreibung |
|---|---|---|
| `title` | `Luftqualität` | Überschrift der Bewertung |
| `entities` | – | Sensoren (ID oder Objekt mit `entity`, `name`, `icon`, `color`, `unit`, `decimals`, `levels`) |
| `graph_entity` | erster Sensor | Verlauf beim Laden |
| `hours_to_show` | `24` | Zeitraum des Verlaufs |
| `update_interval` | `300` | Sekunden zwischen History-Abfragen |
| `graph_height` | `86px` | Höhe des Verlaufs |
| `show_rating` / `show_graph` / `show_axis` | `true` | Bereiche ein-/ausblenden |
| `rating_icon` | `mdi:leaf` | Symbol der Bewertung |
| `ratings` | siehe oben | Eigene Texte: Liste mit drei Einträgen `{label, text, color}` für gut, mäßig, schlecht |

Der visuelle Editor bietet Titel, Sensoren, Start-Verlauf, Zeitraum und die Schalter für Bewertung und Verlauf.

## Media-Karte (Alexa, Sonos, Cast …)

`custom:smart-graph-media-card` steuert einen Media-Player: Symbol und Name, Menü ▾ zum Umschalten von Player und Quelle, Ein/Aus-Taste, Lautstärke mit Stummschalten, Zurück / Wiedergabe / Weiter und frei belegbare Sender-Tasten. Die Karte nutzt nur die Standard-Dienste von `media_player` und funktioniert deshalb mit jeder Integration: Alexa Media Player, Sonos, Google Cast, Spotify, Music Assistant, HEOS, MusicCast, DLNA, Squeezebox, Fernseher und AV-Receiver.

```yaml
type: custom:smart-graph-media-card
entity: media_player.alexa_schlafzimmer
entities:                         # optional: weitere Player, umschaltbar über ▾
  - media_player.alexa_kueche
presets:
  - name: Radio Steiermark
    media_content_id: Radio Steiermark
  - name: Radio Flamingo
    media_content_id: Radio Flamingo
  - name: Ö3
    media_content_id: Hitradio Ö3
```

**Optionsmenü ⋮ (oben rechts):** öffnet ein Menü mit dem Untermenü **Playlists**, dem Untermenü **Quellen** (falls der Player Quellen hat) und **Player-Details** (Home-Assistant-Dialog). Die Playlists kommen automatisch aus der Mediathek des Players – bei Playern ohne Mediathek (z. B. Alexa) trägt man sie selbst ein:

```yaml
playlists:
  - name: Rock Hits
    media_content_id: Rock Hits          # Alexa: Name der Amazon-Music-Playlist (Typ AMAZON_MUSIC automatisch)
  - name: Chill
    media_content_id: spotify:playlist:37i9dQZF1DX4WYpdgoIcn6
    image: /local/covers/chill.jpg
```

Im Editor: „Playlists im Menü ⋮“ → automatisch, eigene Liste (dann erscheint eine Liste wie bei den Sender-Tasten) oder keine.

Unter dem Namen steht, was gerade läuft (Titel · Interpret bzw. Sender), sonst der Zustand. Das Bild des Senders oder Covers erscheint je nach `artwork` als kleines Bild oben links, als Hintergrund oder beides.

Tasten, die der Player nicht unterstützt (`supported_features`), werden ausgeblendet; ist der Player nicht verfügbar, sind alle Bedienelemente gesperrt. Der laufende Sender wird hervorgehoben (Vergleich mit Titel, Sender und Quelle; mit `match: …` lässt sich ein eigener Suchtext angeben). Meldet der Player nur das laufende Lied, bleibt die zuletzt gedrückte Taste hervorgehoben, bis etwas anderes läuft oder die Wiedergabe endet. Der zuletzt gewählte Player bleibt im Browser gespeichert.

**Sender-Tasten (`presets`)** – drei Arten:

| Art | Beispiel | Aufruf |
| --- | --- | --- |
| Medien abspielen | `media_content_id: Hitradio Ö3` | `media_player.play_media` |
| Quelle / Favorit wählen | `source: Ö1` | `media_player.select_source` |
| Beliebige Aktion | `action: script.morgen_radio`, optional `data:` (`entity_id: current` = der gewählte Player) | jeder Dienst |

Jede Taste kann ein **Bild** bekommen (Senderlogo, Playlist-Cover): `image: /local/logos/oe3.png` (Datei im Ordner `www`), eine Internet-Adresse oder im Editor über „Bild hochladen“. Ohne Bild übernimmt die Karte automatisch das Senderbild, sobald der Sender einmal gelaufen ist (`preset_auto_image`).

Ohne `media_content_type` wählt die Karte den passenden Typ nach der Integration des Players:

| Integration | Standard-Typ | Hinweis |
| --- | --- | --- |
| Alexa Media Player | `TUNEIN` | Sendername wie in der Alexa-App. Alternativ `media_content_type: AMAZON_MUSIC` oder `custom` mit einem Sprachbefehl („spiele Radio Steiermark“) |
| Sonos | `favorite_item_id` bei `FV:…`, sonst `music` | Favoriten am einfachsten über `source:` |
| Music Assistant | `radio` (Name) bzw. `music` (URL) | |
| Spotify | `playlist`, `album` … aus der `spotify:`-URI | |
| alle anderen (Cast, DLNA …) | `music` | Stream-URL als `media_content_id` |

| Option | Standard | Beschreibung |
| --- | --- | --- |
| `entity` | – | Media-Player (Pflicht) |
| `entities` | – | Weitere Player, als Text oder `{entity, name}` |
| `name` / `icon` | Entity | Eigener Name / eigenes Symbol |
| `presets` | – | Sender-Tasten, siehe oben; je Taste auch `icon` |
| `preset_columns` | bis zu 3 | Spalten der Sender-Tasten (1–6) |
| `show_power` / `show_volume` / `show_controls` | `true` | Ein/Aus, Lautstärke, Zurück/Wiedergabe/Weiter |
| `show_media_info` | `true` | Titel und Interpret (bzw. Zustand) unter dem Namen |
| `show_source_list` | `true` | Quellen des Players im Menü ▾ |
| `preset_style` | `logo` | Aussehen der Sender-Tasten: `logo` (kleines Bild links neben dem Namen), `tile` (Bild füllt die Taste, Name klein darunter), `text` (nur Name). Tasten ohne Bild zeigen nur den Namen (bei `tile` groß in einer farbigen Fläche) |
| `preset_show_name` | `true` | Bei `tile`: Namen unter dem Bild zeigen |
| `preset_auto_image` | `true` | Hat eine Taste kein eigenes Bild, merkt sich die Karte das Senderbild, sobald dieser Sender einmal läuft (im Browser gespeichert). Erkannt wird der Sender am Titel/Sender/der Quelle oder – z. B. bei Alexa, die oft nur das Lied meldet – daran, dass die Taste in der Karte gedrückt wurde |
| `show_options_menu` | `true` | Optionsmenü ⋮ oben rechts: Playlists, Quellen, Player-Details |
| `playlists` | `auto` | Untermenü „Playlists“ im Menü ⋮: `auto` sucht in der Mediathek des Players (Medienbrowser von HA, z. B. Sonos, Spotify, Music Assistant), eine Liste wie bei `presets` (z. B. für Alexa / Amazon Music) oder `false` |
| `artwork` | `thumbnail` | Bild des Senders bzw. Covers, solange etwas läuft: `thumbnail` (kleines Bild statt Symbol), `background` (unscharf als Hintergrund der Karte, abgedunkelt bzw. aufgehellt, damit alles lesbar bleibt), `both` (beides), `none` (kein Bild) |

Im visuellen Editor lassen sich Player, Name, Symbol und alle Schalter einstellen. Die Sender-Tasten werden dort ohne YAML gepflegt: „Sender hinzufügen“, je Taste Beschriftung, Symbol, Art (Sender/Inhalt abspielen, Quelle/Favorit des Players – mit Auswahlliste der Quellen –, beliebige Aktion) und die passenden Felder; mit den Pfeilen verschieben, mit dem Papierkorb löschen. Unvollständige Tasten werden in der Karte noch nicht angezeigt. Weitere Beispiele: [examples/media.yaml](examples/media.yaml).

## Wetter-Badge

`custom:smart-graph-weather-badge` ist ein **Badge** (die kleinen Elemente oben im Dashboard bzw. in Abschnitten) in Badge-Höhe (36 px) und im Stil der Info-Karten-Designs: getönter Kreis mit dem Wettersymbol, Temperatur, Zustand und dahinter ein dezenter Verlauf der Vorhersage. Die Akzentfarbe richtet sich nach dem Wetter (Sonne gelb, Regen blau, Schnee hellblau, Gewitter violett, Nacht indigo …).

```yaml
type: custom:smart-graph-weather-badge
entity: weather.forecast_home
# info: condition        # condition | high_low | humidity | wind | none
# forecast: auto         # auto | hourly | daily | none
# show_name: false       # Name klein über der Temperatur
```

| Option | Standard | Beschreibung |
| --- | --- | --- |
| `entity` | – | Wetter-Entity (`weather.*`, Pflicht) |
| `name` | Entity-Name | Eigener Name (bei `show_name: true` sichtbar, sonst als Tooltip) |
| `show_name` | `false` | Name klein über der Temperatur |
| `show_icon` | `true` | Wettersymbol im Kreis |
| `info` | `condition` | Zusatz neben der Temperatur: Wetterzustand, Höchst-/Tiefstwert heute, Luftfeuchtigkeit, Wind oder nichts |
| `forecast` | `auto` | Verlauf im Hintergrund: Vorhersage der nächsten 24 Stunden (`hourly`), der nächsten Tage (`daily`), automatisch oder keiner |
| `extras` | – | Zusätzliche Werte hinter der Temperatur, jeweils mit kleinem Symbol (der Badge wird breiter): `humidity` (Luftfeuchtigkeit), `precipitation` (Regenmenge heute laut Vorhersage), `precipitation_probability` (Regenwahrscheinlichkeit), `wind`, `wind_gust`, `pressure`, `uv_index`, `apparent_temperature` (gefühlt), `dew_point`, `cloud_coverage`, `visibility`, `high_low` – oder eigene Sensoren als `{ entity: sensor.regen_heute, icon?, name?, unit?, decimals?, attribute? }` |
| `decimals` | `0` | Nachkommastellen der Temperatur |
| `color` | nach Wetter | Feste Akzentfarbe |

Beispiel mit Luftfeuchtigkeit, Regenmenge und eigenem Regenmesser:

```yaml
type: custom:smart-graph-weather-badge
entity: weather.forecast_home
extras:
  - humidity
  - precipitation
  - entity: sensor.regenmesser_heute
```

Werte, die gerade nicht verfügbar sind, werden ausgeblendet. Im Editor: „Zusätzliche Werte“ (Mehrfachauswahl) und „Eigene Sensoren als zusätzliche Werte“.

Tippen öffnet den Wetter-Dialog von Home Assistant. Im Dashboard: Bearbeiten → Badge hinzufügen → „Smart Graph Weather Badge“; alle Optionen sind im visuellen Editor einstellbar.

## Minimale Konfiguration

```yaml
type: custom:smart-graph-button-card
entity: switch.schreibtisch_1
name: Schreibtisch 1
icon: mdi:desk
value_1:
  type: state
value_2:
  entity: sensor.schreibtisch_1_power
  decimals: 2
  unit: W
```

## Konfigurationsreferenz

Alle Optionen sind optional, außer `entity`. CSS-Längen dürfen als Zahl (wird zu `px`) oder als String (`42px`, `50%`, `var(...)`, `calc(...)`) angegeben werden.

### Allgemein

| Option | Typ | Standard | Beschreibung |
| --- | --- | --- | --- |
| `entity` | string | **Pflicht** | Haupt-Entity (Aktionen, Name, Zustand) |
| `state_entity` | string | `entity` | Separates Entity für die Zustandsauswertung |
| `name` | string \| object | `friendly_name` → Entity-ID | Text, Template (`"{name} ({state})"`) oder `{entity, attribute, template, text}` |
| `icon` | string \| object | natives Zustandssymbol | `mdi:…`, `none`, oder Map je Zustand: `{on: mdi:lamp, off: mdi:lamp-outline}` |
| `picture` | string | – | `/local/…` oder URL. Schlägt das Laden fehl, wird das Symbol angezeigt |
| `use_entity_picture` | bool | `false` | `entity_picture` des Haupt-Entitys verwenden |
| `icon_svg` | string | – | Inline-SVG (wird bereinigt: keine Skripte, Event-Handler oder externen Referenzen) |
| `state_mapping` | object | siehe unten | Zustandsgruppen `on`, `off`, `unavailable` (Listen von Strings) |
| `case_sensitive` | bool | `false` | Groß-/Kleinschreibung bei Zustandsvergleichen beachten |
| `states` | list | `[]` | Eigene Zustandsregeln (siehe unten) |
| `color_targets` | list | `[icon, icon-background]` | Elemente, auf die `states[].color` angewendet wird |
| `thresholds` | object | – | Grenzwertfarben für mehrere Elemente (siehe unten) |
| `unavailable_text` | string | natives HA-Format | Text für `unavailable` |
| `unknown_text` | string | natives HA-Format | Text für `unknown` |
| `show_name` | bool | `true` | Name anzeigen (`false` blendet ihn aus, z. B. bei der Info-Karte) |
| `design` | `standard` \| `subtle` \| `split` \| `badge` \| `sparkline` \| `panel` | `standard` | Fertiges Design (siehe [Designs](#designs)) |
| `design_size` | `normal` \| `double` | `normal` | Höhe der Designs: normale Button-Höhe oder doppelt so hoch |
| `hero` | object \| `false` | je Design | Großer Wert rechts mit Beschriftung |
| `accent_color` | Farbe oder Zuordnung | `on: #22c55e` | Statuspunkt, großer Wert, Design-Graph |
| `text_contrast` | `auto` \| `off` | `auto` | Schriftfarben automatisch lesbar halten (siehe [Lesbarkeit](#lesbarkeit-im-hell--und-dunkelmodus)) |
| `show_unavailable_badge` | bool | `true` | Warn-Badge am Symbol bei `unavailable`/`unknown` oder fehlendem Entity |
| `hold_time` | number (ms) | `500` | Dauer bis zum Hold (200–5000) |
| `double_tap_window` | number (ms) | `250` | Zeitfenster für Double-Tap (100–1000) |

Standard-`state_mapping`:

```yaml
state_mapping:
  "on": ["on", open, opening, playing, home, heating, cooling, unlocked, active, cleaning]
  "off": ["off", closed, closing, idle, not_home, locked, paused, standby, docked]
  unavailable: [unavailable, unknown]
```

Zustände, die keiner Gruppe angehören (z. B. ein numerischer Sensorwert), bilden die Gruppe **`other`**. Für `other` nutzen Farb-Maps den Schlüssel `other`, dann `default`, dann `on`. Ein fehlendes Entity zählt als `unavailable`.

> In YAML 1.1 (YAML-Modus-Dashboards) werden die Schlüssel `on` und `off` ohne Anführungszeichen als `true` bzw. `false` gelesen. Die Karte akzeptiert deshalb `true`/`false` als Alias für `on`/`off`. Empfohlen ist trotzdem: `"on": "#22c55e"`.

### Eigene Zustände (`states`)

```yaml
states:
  - operator: "=="
    value: "on"
    class: active
    color: "#22c55e"
  - operator: ">"
    value: 100
    class: warning
    color: "#ef4444"
    entity: sensor.schreibtisch_1_power   # optional: anderes Entity
    attribute: power                      # optional: Attribut statt State
```

Die **erste** passende Regel gewinnt. `class` wird als CSS-Klasse `custom-<class>` gesetzt und kann als Schlüssel in jeder Farb-Map dienen (z. B. `icon_area.color.warning`). Operatoren: `==`, `!=` (numerisch, wenn beide Seiten Zahlen sind, sonst als String), `>`, `>=`, `<`, `<=` (nur numerisch), `contains`, `regex` (nur bei ausdrücklicher Angabe; ungültige Ausdrücke werden schon in `setConfig` abgelehnt).

### Symbolbereich (`icon_area`)

| Option | Standard | Beschreibung |
| --- | --- | --- |
| `enabled` | `true` | Symbolbereich anzeigen (`icon_area: false` blendet ihn aus) |
| `shape` | `circle` | `circle`, `rounded-square`, `square`, `none` |
| `size` | `42px` | Größe des Hintergrunds |
| `icon_size` | `22px` | Symbolgröße |
| `position` | `left` | `left` oder `right` |
| `color` | HA-Variablen | Map je Zustand oder Klasse: `on`, `off`, `unavailable`, `other`, `default`, eigene Klassen |
| `color_source` | `fixed` | `fixed`: Farbe aus `color`. `light`: Bei einem eingeschalteten Licht (z. B. WLED-Streifen) leuchtet das Symbol in der aktuell eingestellten Farbe (aus `rgb_color`, `hs_color` oder der Farbtemperatur); ist das Licht aus, gilt wieder `color`. Sehr helle Farben wie Weiß werden auf hellem Hintergrund leicht abgedunkelt, damit das Symbol sichtbar bleibt. Im Editor: „Symbolfarbe bei eingeschaltetem Licht“ (erscheint bei `light.*`-Entities) |
| `background` | 16 % der Symbolfarbe | Map wie `color` |
| `animation` | alles `none` | `on`, `off`, `unavailable`, `other`, eigene Klassen: `none`, `pulse`, `rotate`, `blink`; `duration: 1.5s` |

Beispiel für einen LED-Streifen:

```yaml
type: custom:smart-graph-button-card
entity: light.wled_wohnzimmer
icon: mdi:led-strip-variant
icon_area:
  color_source: light
```

### Name (`name_style`)

| Option | Standard |
| --- | --- |
| `font_size` | `14px` |
| `font_weight` | `600` |
| `color` | `var(--primary-text-color)` (auch als Map je Zustand) |
| `overflow` | `ellipsis` (`ellipsis`, `clip`, `wrap`) |
| `max_lines` | `1` (1–5) |
| `align` | `left` (`left`, `center`, `right`) |

### Werte (`value_1`, `value_2`, `values`)

| Option | Beschreibung |
| --- | --- |
| `entity` | Quelle (Standard: Haupt-Entity) |
| `type` | `state` (Standard), `attribute`, `text`, `name`, `last_changed`, `last_updated`, `template` |
| `attribute` | Attributname (bei `type: attribute`, oder als `{attribute}` im Template) |
| `text` | Fester Text (`type: text`) |
| `template` | Sicheres Template, siehe unten |
| `format` | `number`, `integer`, `duration` (Sekunden → h:mm:ss), `relative`, `datetime`, `date`, `time` |
| `decimals` | Dezimalstellen (0–10). Ohne Angabe gilt die Anzeigegenauigkeit des Entitys, sonst maximal 2 |
| `unit` | Eigene Einheit |
| `use_entity_unit` | `true`: Entity-Einheit bevorzugen; `false`: nur `unit`; ohne Angabe: `unit`, sonst Entity-Einheit |
| `prefix` / `suffix` | Text davor/danach |
| `icon` | Kleines Symbol vor dem Wert |
| `label` | Bezeichnung für Screenreader (`aria-label`), z. B. „Verbrauch“ |
| `fallback` | Anzeige bei fehlendem/ungültigem Wert (Standard `–`) |
| `color` | Farbe (String oder Map je Zustand) |
| `font_size` / `font_weight` | Schrift |
| `hide_if_unavailable` | Wert ausblenden, wenn das Entity fehlt oder unavailable/unknown ist |
| `state_mapping` | Anzeige-Mapping, z. B. `"on": Ein` (ohne Beachtung der Groß-/Kleinschreibung) |
| `thresholds` | Wertfarbe nach Grenzwerten: `[{value: 0, color: …}, …]` |
| `raw` | `true`: Rohzustand statt der nativ lokalisierten HA-Anzeige |

`values`: `layout: inline | stacked` (Standard `inline`), `separator: " · "`, `gap: 4px`, `font_size: 12px`, `color` (Schriftfarbe beider Werte), `status_dot` (farbiger Punkt vor Wert 1, Standard `false`).

### Schriftfarben

| Option | Wirkt auf | Standard |
| --- | --- | --- |
| `name_style.color` | Name | `var(--primary-text-color)` |
| `values.color` | beide Werte inkl. Einheit, Symbol und Trennzeichen | `var(--secondary-text-color)` |
| `value_1.color` / `value_2.color` | nur diesen Wert (hat Vorrang vor `values.color`) | `values.color` |

Jede Schriftfarbe ist eine CSS-Farbe oder eine Zuordnung je Zustand bzw. eigener Klasse:

```yaml
name_style:
  color: "#ffffff"
values:
  color:
    "on": "#22c55e"
    "off": "#9ca3af"
value_2:
  entity: sensor.schreibtisch_1_power
  color: "#f59e0b"
```

Vorrang: `thresholds.apply_to` (`name`, `value-1`, `value-2`) → `states[].color` über `color_targets` → Wert-Grenzwerte (`value_N.thresholds`) → konfigurierte Farbe → Theme. Im Editor stehen die Schriftfarben unter „Farben & Hintergrund → Schrift“. Ist eine Farbe im YAML je Zustand festgelegt, zeigt der Editor nur einen Hinweis und lässt die Zuordnung unverändert.

#### Lesbarkeit im Hell- und Dunkelmodus

Mit `text_contrast: auto` (Standard) prüft die Karte nach jeder Änderung den Kontrast jeder Schrift (Name, Werte, Einheiten, Trenner) gegen den tatsächlichen Hintergrund. Dazu zählen der Hintergrund des Themes, der Statushintergrund, das Overlay und ein Graph, der hinter der Schrift liegt.

- Ist eine Schrift zu schwach (unter 4,5 : 1, bei großer Schrift unter 3 : 1), wird nur ihre **Helligkeit** angepasst. Der Farbton bleibt erhalten: Dunkelblau wird im Dunkelmodus zu Hellblau, Gelb wird im Hellmodus zu Ocker. Angestrebt wird ein gut lesbarer Kontrast von 7 : 1.
- Liegt die Schrift über einem Graphen, bekommt sie zusätzlich einen weichen Schein in der Hintergrundfarbe.
- Ausreichend lesbare Farben werden nie verändert. Beim Wechsel zwischen Hell und Dunkel wird automatisch neu geprüft.
- `text_contrast: off` zeigt die konfigurierten Farben exakt so an, wie sie eingestellt sind. Im Editor: „Farben & Hintergrund → Schrift → Schriftfarbe automatisch lesbar halten“.

Es wird **nie** `undefined`, `null`, `NaN` oder `Infinity` angezeigt. In solchen Fällen erscheint `fallback`.

### Templates

Templates sind reine Platzhalter-Ersetzung. Es gibt kein `eval()`, kein `Function()` und keine JavaScript-Ausführung.

| Variable | Bedeutung |
| --- | --- |
| `{value}` | Formatierter Wert (ohne Einheit) |
| `{unit}` | Einheit |
| `{state}` | Zustand (gemappt oder nativ lokalisiert) |
| `{raw}` | Rohwert |
| `{name}` / `{friendly_name}` | Anzeigename des Entitys |
| `{entity_id}` | Entity-ID |
| `{attribute}` | Wert des konfigurierten `attribute` |
| `{attr:NAME}` | Beliebiges Attribut, z. B. `{attr:current_temperature}` |
| `{last_changed}` / `{last_updated}` | Relative Zeit („vor 5 Minuten“) |

Unbekannte Variablen werden zu einem leeren String. Ist das Ergebnis leer, erscheint `fallback`.

```yaml
value_2:
  entity: sensor.schreibtisch_1_power
  decimals: 1
  template: "{value} {unit} · seit {last_changed}"
```

### Graph (`graph`)

| Option | Standard | Beschreibung |
| --- | --- | --- |
| `enabled` | `true`, sobald `graph` angegeben ist | |
| `entity` | Haupt-Entity | Numerischer Sensor |
| `attribute` | – | Attribut statt State darstellen |
| `type` | `line` | siehe [Grapharten](#grapharten) |
| `position` | `full` | `full`, `after-icon`, `left`, `right`, `bottom`, `icon-area`, `custom`, siehe [Graphpositionen](#graphpositionen) |
| `width` | `50%` | Breite bei `left`/`right` |
| `height` | `35%` | Höhe bei `bottom` |
| `bounds` | `0%/0%/100%/100%` | `left`, `top`, `width`, `height` bei `custom` |
| `icon_offset` | `0px` | Abstand zwischen Symbol und Graph bei `after-icon` (auch negativ möglich) |
| `hours_to_show` | `24` | Zeitraum in Stunden (> 0, ≤ 8760) |
| `max_points` | `60` | Anzahl Zeitfenster bzw. Balken (2–1000) |
| `aggregation` | `average` | `average` (zeitgewichtet), `min`, `max`, `last`, `sum` |
| `baseline` | `zero` | Bezugslinie für Flächen/Balken: `zero` (Nulllinie) oder `bottom` (unterer Rand, Skala an die Daten angepasst, z. B. 20–28 °C) |
| `fill` | `hold` | `hold`: Wert gilt bis zur nächsten Änderung; `gap`: leere Zeitfenster bleiben leer |
| `min` / `max` | `auto` | Zahl oder `auto` |
| `line_width` | `2` | 0–20 |
| `bar_width` | automatisch | Feste Balkenbreite in px |
| `bar_gap` | `2` | Abstand zwischen Balken in px |
| `bar_radius` | `1` | Eckenradius der Balken |
| `opacity` | `0.6` | Deckkraft der gesamten Graph-Ebene |
| `fill_opacity` | `0.25` | Deckkraft der Fläche (`area`, `stepped`, Balken bei `line-bar`) |
| `show_points` / `show_grid` / `show_axis` / `show_labels` | `false` | Punkte, Hilfslinien, Nulllinie, Min/Max-Beschriftung |
| `fade` | `0` | Weicher Übergang an Beginn **und** Ende (Kurzform für beide) |
| `fade_start` | `fade` | Weicher Übergang am Beginn (links, ältere Werte): Zahl = % der Graphbreite (0–50), oder `"15%"` / `"40px"` |
| `headroom` | `0.05` | Luft über dem höchsten Wert als Anteil (0–2) |
| `fade_end` | `fade` | Weicher Übergang am Ende (rechts, aktuelle Werte), gleiche Angaben wie `fade_start` |
| `color_mode` | `state` | siehe [Farbmodi](#farbmodi) |
| `color` | `var(--sgbc-graph-color)` | Farbe für `fixed` und Rückfallfarbe. `auto` wählt die Farbe nach Sensortyp |
| `colors` | HA-Variablen | Map je Zustand für `state` |
| `thresholds` | `[]` | `[{value, color}, …]` für `thresholds`, beliebig viele Einträge |
| `threshold_mode` | `current` | `current` (ganzer Graph nach aktuellem Wert), `per-point` (jeder Wert eigene Farbe) oder `vertical` (Farbbänder nach Höhe) |
| `threshold_blend` | `hard` | Bei `vertical`: `hard` (harte Grenze) oder `smooth` (weicher Verlauf) |
| `gradient` | grün → rot, vertikal | `{from, to, direction: vertical \| horizontal}` |
| `positive_color` | `#a855f7` | Farbe über `split_at` bei `color_mode: sign` |
| `negative_color` | `#22c55e` | Farbe unter `split_at` bei `color_mode: sign` |
| `split_at` | `0` | Grenze für `color_mode: sign` |
| `update_interval` | `300` | Sekunden zwischen History-Abfragen (mindestens 10) |

### Statushintergrund, Ebenen, Grenzwerte, Layout

```yaml
state_background:
  enabled: false
  colors: { "on": "rgba(34, 197, 94, 0.14)", "off": transparent, unavailable: "rgba(107, 114, 128, 0.10)" }

layers:
  graph_above_state_background: true
  overlay: { enabled: false, color: "rgba(0, 0, 0, 0.04)" }

thresholds:
  entity: sensor.x          # Standard: Graph-Entity, sonst Haupt-Entity
  attribute: power          # optional
  ranges:                   # from inklusive, to exklusiv, letzter Bereich nach oben offen
    - { from: 0, to: 10, color: "#22c55e" }
    - { from: 10, to: 100, color: "#f59e0b" }
    - { from: 100, color: "#ef4444" }
  apply_to: [icon, graph]   # icon, icon-background, graph, card-background, name, value-1, value-2

layout:
  height: 64px              # oder auto
  min_width: 180px
  padding: 8px 12px
  gap: 10px
  border_radius: 14px
  border_width: 1px
  border_color: var(--divider-color)
  overflow: hidden
  background: var(--ha-card-background)
```

**Grenzwertsemantik:** `from` ist inklusive, `to` ist exklusiv, ein fehlendes `to` ist nach oben offen, ein fehlendes `from` nach unten. Bei Überschneidungen gewinnt der erste passende Bereich. Werte unterhalb aller Bereiche erhalten keine Grenzwertfarbe; dann gilt die normale Farbe. Eine Liste `[{value, color}]` wird aufsteigend sortiert in Bereiche umgewandelt (`from = value`, `to = nächster value`).

**Vorrang der Farben:** `thresholds.apply_to` → `states[].color` (über `color_targets`) → Zustandsfarbe. Beim Graphen gilt die Übersteuerung nur für `fixed`, `state` und `thresholds/current`. `gradient` und `per-point` behalten ihre eigene Farblogik. Für `icon-background` und `card-background` wird die Grenzwertfarbe automatisch transparent gemischt (18 % bzw. 16 %), damit Symbol und Text lesbar bleiben.

### Aktionen

```yaml
tap_action:                 # Standard: toggle für schaltbare Domains, sonst more-info
  action: toggle
hold_action:                # Standard: more-info
  action: more-info
double_tap_action:          # Standard: none
  action: navigate
  navigation_path: /lovelace/office
```

| Aktion | Felder |
| --- | --- |
| `more-info` | `entity` |
| `toggle` | `entity`. Domain-spezifisch: `lock` → lock/unlock, `button` → press, `scene`/`script` → turn_on, sonst `<domain>.toggle` bzw. `homeassistant.toggle` |
| `navigate` | `navigation_path`, `navigation_replace` |
| `url` | `url_path`, `new_tab` (Standard `true`) |
| `perform-action` | `perform_action: domain.aktion`, `target`, `data` |
| `call-service` | Alias: `service`, `target`, `data` bzw. `service_data` |
| `assist` | Öffnet Assist über das native `hass-action`-Ereignis (versionsabhängig) |
| `fire-dom-event` | Löst `ll-custom` aus |
| `none` | – |

Alle Aktionen unterstützen `confirmation: true` oder `confirmation: {text: "…", exemptions: [{user: <user_id>}]}`.

**Bedienung:** Maus und Touch (Pointer Events), Enter und Leertaste. Nach einem Hold wird kein Tap ausgelöst. Ein Double-Tap löst keinen Tap aus. Ist eine Double-Tap-Aktion konfiguriert, wird ein einzelner Tap um `double_tap_window` verzögert. Ohne Double-Tap-Aktion kommt der Tap sofort. Eine Bewegung von mehr als 12 px bricht die Geste ab (Scrollen).

### CSS-Variablen

Die folgenden Variablen können über ein Theme gesetzt werden. Werte aus der Kartenkonfiguration haben Vorrang. Symbol- und Hintergrundfarben werden zustandsabhängig dynamisch gesetzt.

`--sgbc-height`, `--sgbc-min-width`, `--sgbc-padding`, `--sgbc-gap`, `--sgbc-border-radius`, `--sgbc-border-width`, `--sgbc-border-color`, `--sgbc-background`, `--sgbc-icon-color`, `--sgbc-icon-background`, `--sgbc-graph-color`, `--sgbc-graph-opacity`, `--sgbc-name-color`, `--sgbc-value-color`.

Die Karte verwendet außerdem die HA-Variablen `--ha-card-background`, `--card-background-color`, `--primary-text-color`, `--secondary-text-color`, `--divider-color`, `--primary-color`, `--state-icon-color`, `--state-icon-active-color`, `--disabled-text-color`, `--error-color`. Damit funktioniert sie mit hellen und dunklen Themes.

## Grapharten

| Typ | Darstellung |
| --- | --- |
| `line` | Linie, Lücken bei fehlenden Daten, einzelne Punkte als Kreis |
| `area` | Linie mit gefüllter Fläche bis zur Nulllinie |
| `smooth-area` | Abgerundete Linie mit Fläche bis zur Nulllinie. Die Fläche ist weit weg von null kräftig und wird zur Nulllinie hin durchsichtig (Energie-Optik). Standard `fill_opacity`: 0.6 |
| `bar` | Balken je Zeitfenster mit `bar_gap`, `bar_width` und `bar_radius`; negative Werte wachsen nach unten |
| `column` | Lückenlose Säulen (Histogramm-Optik) |
| `stepped` | Stufenlinie mit Fläche, passend für Zustandswechsel |
| `line-bar` | Halbtransparente Balken plus Linie durch die Balkenmitten |
| `smooth-line-bar` | Wie `line-bar`, aber mit abgerundeter Linie. Die Glättung ist monoton: Spitzen werden gerundet, die Linie schießt aber nie über die echten Werte hinaus |

Skalierung: automatisch oder manuell (`min`/`max`). Bei konstanten Werten wird symmetrisch aufgepolstert. Flächen- und Balkengraphen beziehen im Auto-Modus die Nulllinie ein. Darüber gibt es 5 % Luft.

## Graphpositionen

| Position | Bedeutung |
| --- | --- |
| `full` | Gesamter Kartenhintergrund |
| `after-icon` | Beginnt direkt nach dem Symbol und reicht bis zum Kartenrand. Bei `icon_area.position: right` gespiegelt (vom linken Rand bis vor das Symbol). Abstand zum Symbol über `icon_offset`. Ohne Symbolbereich wie `full` |
| `left` | Linker Anteil, Breite über `width` |
| `right` | Rechter Anteil, Breite über `width` |
| `bottom` | Streifen unten, Höhe über `height` |
| `icon-area` | Nur innerhalb des Symbolhintergrunds (in dessen Form beschnitten) |
| `custom` | Freie Position über `bounds: {left, top, width, height}` |

Der Graph wird immer innerhalb der Karte beschnitten: per `overflow: hidden` mit Border-Radius und zusätzlich per SVG-`clipPath`.

## Weicher Übergang an den Rändern

Mit `fade_start` und `fade_end` läuft der Graph an Anfang und Ende sanft in den Kartenhintergrund aus, statt hart abgeschnitten zu werden. Der Wert legt fest, wie breit die Übergangszone ist: je größer, desto weicher.

```yaml
graph:
  fade_start: 25    # linke 25 % der Graphbreite blenden weich ein
  fade_end: 10      # rechte 10 % blenden weich aus
# oder für beide Seiten gleich:
graph:
  fade: 15
```

Das Ausblenden ist eine CSS-Maske. Es wirkt bei allen Graph-Typen, Positionen und Themes und kostet keine Rechenleistung. Im Editor gibt es dafür zwei Schieberegler im Bereich „Graph“.

## Farbmodi

```yaml
# fixed
graph: { color_mode: fixed, color: "#06b6d4" }

# state
graph:
  color_mode: state
  colors: { "on": "#22c55e", "off": "#94a3b8", unavailable: "#6b7280" }

# thresholds
graph:
  color_mode: thresholds
  threshold_mode: per-point      # oder current (Farbe nach aktuellem Wert)
  thresholds:
    - { value: 0, color: "#22c55e" }
    - { value: 10, color: "#f59e0b" }
    - { value: 100, color: "#ef4444" }

# gradient
graph:
  color_mode: gradient
  gradient: { from: "#22c55e", to: "#ef4444", direction: vertical }
```

Bei `per-point` wird jeder Balken einzeln eingefärbt. Linien und Flächen erhalten Segmentfarben über einen horizontalen Verlauf mit harten Übergängen.

**Farbbänder nach Höhe (`threshold_mode: vertical`).** Die Farbe richtet sich danach, auf welcher Höhe ein Teil des Graphen liegt. Eine Kurve, die von 12 °C auf 27 °C steigt, ist unten blau, ab der 15-Grad-Höhe gelb und ab 25 Grad rot. Das gilt für Linie, Fläche und Balken. Beliebig viele Grenzen sind möglich, jede Farbe gilt **ab** ihrem Wert:

```yaml
graph:
  color_mode: thresholds
  threshold_mode: vertical
  threshold_blend: hard        # oder smooth für einen weichen Verlauf
  thresholds:
    - { value: -40, color: "#3b82f6" }   # bis 15 °C: blau
    - { value: 15, color: "#eab308" }    # 15 bis unter 25 °C: gelb
    - { value: 25, color: "#ef4444" }    # ab 25 °C: rot
```

Unterhalb der kleinsten Grenze gilt die normale Graphfarbe. Deshalb steht oben für „blau“ ein sehr niedriger Wert. Bei `smooth` ist die Farbe genau beim Wert erreicht, dazwischen wird weich übergeblendet. Grenzen außerhalb des sichtbaren Bereichs werden korrekt berücksichtigt.

**Über/Unter Null (`sign`).** Zum Beispiel für Netzbezug (positiv) und Einspeisung (negativ). Linie und Fläche wechseln die Farbe genau an der Nulllinie, auch mitten in einem Linienstück. Balken werden nach Vorzeichen eingefärbt.

```yaml
graph:
  type: smooth-area
  color_mode: sign
  positive_color: "#a855f7"   # über 0: lila
  negative_color: "#22c55e"   # unter 0: grün
  split_at: 0                 # optional, andere Grenze
```

**Beliebig viele Farben je Wertebereich.** Jeder Eintrag gilt **ab** seinem Wert bis zum nächsthöheren Eintrag. Die Reihenfolge in der Liste ist egal, die Karte sortiert selbst:

```yaml
graph:
  type: smooth-line-bar
  color_mode: thresholds
  threshold_mode: per-point
  thresholds:
    - { value: 10, color: "#22c55e" }    # 10 bis unter 50 W: grün
    - { value: 50, color: "#eab308" }    # 50 bis unter 100 W: gelb
    - { value: 100, color: "#f97316" }   # 100 bis unter 200 W: orange
    - { value: 200, color: "#ef4444" }   # ab 200 W: rot
```

Werte unter dem kleinsten Eintrag (hier unter 10 W) erhalten die normale Graphfarbe (`color`). Soll auch dieser Bereich farbig sein, einen Eintrag mit `value: 0` ergänzen.

## Ebenen

1. Grundhintergrund (`ha-card`)
2. Statushintergrund
3. Graph
4. Lesbarkeits-Overlay
5. Symbol, Name, Werte
6. Fokus-, Hover- und Pressed-Effekte

Mit `layers.graph_above_state_background: false` tauschen 2 und 3 die Plätze. Alle Ebenen sind eigene, absolut positionierte Elemente und überschreiben sich nicht.

## Beispiele

Vollständige Beispiele liegen in [`examples/`](examples/):

- [`basic.yaml`](examples/basic.yaml): Schreibtisch, Balkengraph links mit Grenzwertfarben
- [`full-background-graph.yaml`](examples/full-background-graph.yaml): Flächengraph über die ganze Karte, Overlay, Graphfarbe nach Zustand
- [`state-background.yaml`](examples/state-background.yaml): Statushintergrund und halbtransparenter Graph
- [`threshold-colors.yaml`](examples/threshold-colors.yaml): 0 bis < 10 W grün, 10 bis < 100 W orange, ab 100 W rot; angewendet auf Symbol, Graph und Hintergrund
- [`info-cards.yaml`](examples/info-cards.yaml): 4 Info-Karten nebeneinander (Temperatur, Feuchtigkeit, CO₂, Luftdruck)
- [`designs.yaml`](examples/designs.yaml): die vier Designs für einen Schreibtisch mit Leistungsmesser
- [`info-designs.yaml`](examples/info-designs.yaml): Info-Karten als moderne Kachel, mit Zustandsring und als kompakte Statuskachel
- [`overview.yaml`](examples/overview.yaml): Luftqualität mit Gesamtbewertung und umschaltbarem Verlauf
- [`grid-power.yaml`](examples/grid-power.yaml): Netzbezug/Einspeisung als abgerundete Fläche, lila über und grün unter null

## Visueller Editor

Im Karteneditor stehen zur Verfügung:

- **Entity, Name, Symbol** sowie **Werte** (Wert 1 und Wert 2)
- **Design:** Auswahl der vier Designs, „Doppelte Höhe“, großer Wert an/aus und seine Beschriftung; Akzentfarben unter „Farben & Hintergrund“
- **Graph:** aktivieren, Entity, Typ, Position, Zeitraum, weicher Übergang am Beginn und am Ende (Schieberegler)
- **Graph-Farben:** Farbmodus wählen. Je nach Modus erscheinen eine feste Farbe, Farben für Ein/Aus, Verlauf von/bis, Farben über/unter null oder die **Grenzwertliste**: Zeilen mit „Ab Wert“ und Farbe, beliebig viele über „Grenzwert hinzufügen“, Entfernen mit ✕. Beim ersten Wechsel auf „Nach Grenzwerten“ ist die Liste mit 10/50/100/200 vorbelegt.
- **Farben & Hintergrund:** Symbolfarben und Statushintergrund für Ein/Aus, Schriftfarben für Name, beide Werte, Wert 1 und Wert 2, Schalter für automatisch lesbare Schrift
- **Interaktionen:** Tap, Hold, Double-Tap

**Farbfelder:** Ein Klick auf den runden Farbkreis öffnet die Farbauswahl des Browsers (Maus). Im Textfeld daneben kann jeder CSS-Wert eingetippt werden, z. B. `#22c55e`, `rgba(34, 197, 94, 0.15)`, `orange` oder `var(--primary-color)`. Wird bei einer halbtransparenten `rgba()`-Farbe mit der Maus eine neue Farbe gewählt, bleibt die Transparenz erhalten.

## History-Abfrage

Der Zugriff ist vollständig in `src/history-provider.js` gekapselt.

1. **WebSocket** `history/history_during_period` mit `minimal_response`, `no_attributes` und `significant_changes_only: false`. Diesen Befehl nutzt auch das offizielle HA-Frontend. Er ist aber **nicht als versionierte öffentliche API dokumentiert**. Die Antwort wird deshalb defensiv geparst (komprimiertes Format `s`/`lu`/`lc` und Vollformat).
2. **REST-Fallback** `GET /api/history/period/<start>?filter_entity_id=…` (offiziell dokumentiert), falls der WebSocket-Befehl fehlt (`unknown_command`) oder fehlschlägt.
3. Schlagen beide fehl, bleibt der Graph leer. Die Karte funktioniert normal weiter (`data-graph-status="error"` am `ha-card`).

Verarbeitung: Werte werden streng numerisch geparst. `unavailable`, `unknown`, `null` und nicht numerische Werte werden zu **Lücken**. Danach wird nach Zeit sortiert und in `max_points` Zeitfenster reduziert. `average` ist dabei zeitgewichtet.

Cache-Schlüssel: Entity-ID, Attribut, Startzeit, Endzeit, Zeitraum (`hours_to_show`) und Auflösung (`max_points:aggregation:fill`). Start und Ende werden auf das `update_interval` gerundet. So teilen sich mehrere Karten mit demselben Sensor eine Anfrage und einen Cache-Eintrag.

## Performance

- Die Karte rendert nur neu, wenn sich ein **beobachtetes** Entity ändert (Vergleich der State-Objekt-Referenzen) oder wenn Sprache oder Theme wechseln. Updates werden per `requestAnimationFrame` gebündelt.
- Die DOM-Struktur wird nur in `setConfig` erzeugt. Danach werden nur Text, Attribute und CSS-Variablen aktualisiert.
- History wird **nicht** bei jedem `hass`-Update geladen, sondern einmalig und dann alle `update_interval` Sekunden (Standard 300, Minimum 10). Zwischen den Abfragen werden neue Zustände aus `hass` lokal an die Datenreihe angehängt. Das kostet keine Netzwerklast.
- Gleiche Anfragen werden zusammengefasst (In-flight-Map) und zwischengespeichert (LRU, 60 Einträge).
- Veraltete Antworten werden per Request-Token verworfen. `hass.callWS` und `hass.callApi` bieten kein `AbortSignal`.
- `ResizeObserver` zeichnet den Graphen nur bei Größenänderung neu, in echter Pixelgröße (keine Verzerrung).
- Beim Entfernen der Karte werden Listener, `ResizeObserver`, Intervall-Timer, Animation-Frames und Gesten-Timer vollständig abgebaut.
- Sehr lange Zeiträume (z. B. Wochen bei sekündlich meldenden Sensoren) erzeugen große History-Antworten. Für solche Fälle `update_interval` erhöhen.

## Fehlerbehandlung

`setConfig()` prüft die Konfiguration und zeigt **alle** Fehler gesammelt direkt in der Karte an, statt eine unbehandelte Ausnahme zu werfen. Zum Beispiel:

- `„entity“ fehlt …`
- `graph.type „pie“ ist ungültig. Erlaubt: line, area, smooth-area, bar, column, stepped, line-bar, smooth-line-bar.`
- `graph.hours_to_show muss größer als 0 sein.`
- `graph.position „top“ ist unbekannt …`
- `graph.thresholds[0].value muss eine Zahl sein.`
- `Ungültiger Zahlenbereich: graph.min (10) muss kleiner als graph.max (5) sein.`

Zur Laufzeit bleibt die Karte bedienbar, wenn das Haupt-Entity unavailable ist (Badge, gedämpfte Darstellung, Text) oder fehlt („Entity nicht gefunden“ im `aria-label`), wenn das Graph-Entity fehlt, wenn keine History vorhanden ist oder der Aufruf fehlschlägt, wenn Werte nicht numerisch sind (Fallback) und wenn ein Bild nicht geladen werden kann (Rückfall auf das Symbol). Renderfehler werden abgefangen und in der Konsole protokolliert.

## Kompatibilität

**Home Assistant:** 2024.1 oder neuer empfohlen (`hacs.json`). Versionsabhängige Teile sind abgesichert:

| Funktion | Ab Version | Ohne Unterstützung |
| --- | --- | --- |
| `hass.formatEntityState` (lokalisierte Zustände) | 2023.9 | Rohzustand bzw. eigene Texte |
| `ha-state-icon` (natives Zustandssymbol) | 2024.2 | Attribut-Icon bzw. Domain-Symbol |
| `getGridOptions` (Sections) | 2024.11 | wird ignoriert, `getCardSize` greift |
| `ui_action`-Selector im Editor | 2023.x | YAML verwenden |
| `hass-action`-Ereignis (nur `assist`) | neuere Versionen | Assist-Aktion bleibt wirkungslos |

Ausgelegt für die Dashboard-Layouts Masonry, Sections, Grid, Horizontal Stack und Vertical Stack. `min-width` ist auf die verfügbare Breite begrenzt, damit kein horizontaler Scrollbalken entsteht.

**Browser:** aktuelle Versionen von Chrome/Edge (≥ 111), Firefox (≥ 113), Safari (≥ 16.2) und der HA Companion Apps. Benötigt werden Custom Elements v1, Shadow DOM, Pointer Events, `ResizeObserver`, CSS `color-mix()` und `Intl`. Ohne `color-mix()` fehlen nur die automatisch abgeleiteten transparenten Hintergründe. Explizit konfigurierte Farben funktionieren immer.

## Entwicklung, Build und Tests

```bash
npm install
npm run build        # Rollup + Terser → dist/smart-graph-button-card.js (minifiziert)
npm run watch        # Rebuild bei Änderungen
npm test             # Unit-Tests (node:test, keine Zusatzpakete)
node scripts/build.mjs   # Build ohne npm-Pakete (nicht minifiziert)
```

Projektstruktur:

```
src/
  smart-graph-button-card.js         Karte (Lebenszyklus, DOM, Updates)
  smart-graph-button-card-editor.js  Visueller Editor (ha-form)
  graph-renderer.js                  SVG-Renderer
  data-reducer.js                    Zeitfenster und Aggregation
  history-provider.js                History-Zugriff, Cache, Fallback
  action-handler.js                  Gesten und Aktionen
  value-formatter.js                 Zahlen, Datum, Templates, Werte
  state-resolver.js                  Zustandsgruppen, Regeln, Grenzwerte
  config-validator.js                Validierung und Standardwerte
  styles.js                          CSS
  color-utils.js                     Farb-Hilfsfunktionen für den Editor
  utils.js                           Hilfsfunktionen
test/                                Unit-Tests
examples/                            YAML-Beispiele
scripts/build.mjs                    Bundler ohne Abhängigkeiten
```

Die Tests decken unter anderem ab: on/off-Auswertung, unavailable/unknown, Zahlenformat und Dezimalstellen, fehlende Entities, ungültige Zahlen, Grenzwertgrenzen, Datenreduktion, konstante und negative Graphwerte, leere History, einzelne Datenpunkte, die Trennung von Tap, Hold und Double-Tap, die `setConfig`-Validierung und die Gültigkeit aller Beispieldateien.

## Bekannte Einschränkungen

- Die Bestätigung (`confirmation`) nutzt den Browser-Dialog `window.confirm`, nicht den HA-Dialog.
- Die `assist`-Aktion ist auf das `hass-action`-Ereignis des Frontends angewiesen.
- Langzeitstatistiken (`recorder/statistics_during_period`) werden nicht genutzt. Es werden nur Rohdaten aus der History geladen, begrenzt durch die Recorder-Aufbewahrung (Standard 10 Tage).
- Kein Abbrechen laufender History-Anfragen möglich (keine `AbortSignal`-Unterstützung in `hass.callWS`). Veraltete Antworten werden verworfen.
- Der visuelle Editor deckt die wichtigsten Optionen ab. Eigene Zustände, Ebenen, Layout und die Grenzwertfarben für Symbol und Hintergrund (`thresholds` auf oberster Ebene) werden im YAML-Modus konfiguriert.
- Die Farbauswahl mit der Maus nutzt den Farbwähler des Browsers. Er kennt keine Transparenz; diese wird über das Textfeld eingestellt.

## Lizenz

[MIT](LICENSE)
