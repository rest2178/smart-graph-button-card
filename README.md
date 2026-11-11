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
- Graphpositionen `full`, `left`, `right`, `bottom`, `icon-area`, `custom`
- Farbmodi `fixed`, `state`, `thresholds` (beliebig viele Grenzwerte, `current` oder `per-point`), `gradient`, `sign` (über/unter null)
- Statusabhängiger Kartenhintergrund, Lesbarkeits-Overlay, Ebenenreihenfolge einstellbar
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
| `background` | 16 % der Symbolfarbe | Map wie `color` |
| `animation` | alles `none` | `on`, `off`, `unavailable`, `other`, eigene Klassen: `none`, `pulse`, `rotate`, `blink`; `duration: 1.5s` |

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

`values`: `layout: inline | stacked` (Standard `inline`), `separator: " · "`, `gap: 4px`, `font_size: 12px`.

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
| `position` | `full` | siehe [Graphpositionen](#graphpositionen) |
| `width` | `50%` | Breite bei `left`/`right` |
| `height` | `35%` | Höhe bei `bottom` |
| `bounds` | `0%/0%/100%/100%` | `left`, `top`, `width`, `height` bei `custom` |
| `hours_to_show` | `24` | Zeitraum in Stunden (> 0, ≤ 8760) |
| `max_points` | `60` | Anzahl Zeitfenster bzw. Balken (2–1000) |
| `aggregation` | `average` | `average` (zeitgewichtet), `min`, `max`, `last`, `sum` |
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
| `fade_end` | `fade` | Weicher Übergang am Ende (rechts, aktuelle Werte), gleiche Angaben wie `fade_start` |
| `color_mode` | `state` | siehe [Farbmodi](#farbmodi) |
| `color` | `var(--sgbc-graph-color)` | Farbe für `fixed` und Rückfallfarbe |
| `colors` | HA-Variablen | Map je Zustand für `state` |
| `thresholds` | `[]` | `[{value, color}, …]` für `thresholds`, beliebig viele Einträge |
| `threshold_mode` | `current` | `current` oder `per-point` |
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
- [`grid-power.yaml`](examples/grid-power.yaml): Netzbezug/Einspeisung als abgerundete Fläche, lila über und grün unter null

## Visueller Editor

Im Karteneditor stehen zur Verfügung:

- **Entity, Name, Symbol** sowie **Werte** (Wert 1 und Wert 2)
- **Graph:** aktivieren, Entity, Typ, Position, Zeitraum, weicher Übergang am Beginn und am Ende (Schieberegler)
- **Graph-Farben:** Farbmodus wählen. Je nach Modus erscheinen eine feste Farbe, Farben für Ein/Aus, Verlauf von/bis, Farben über/unter null oder die **Grenzwertliste**: Zeilen mit „Ab Wert“ und Farbe, beliebig viele über „Grenzwert hinzufügen“, Entfernen mit ✕. Beim ersten Wechsel auf „Nach Grenzwerten“ ist die Liste mit 10/50/100/200 vorbelegt.
- **Farben & Hintergrund:** Symbolfarben und Statushintergrund für Ein/Aus
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
