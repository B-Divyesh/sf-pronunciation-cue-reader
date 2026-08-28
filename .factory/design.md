# Say It Right — visual thesis

## Direction: generative geometry as a pronunciation field

Speech is invisible, but pronunciation cues turn it into something a reader can
hold onto. The visual system treats words as small geometric particles that pass
through a user-owned cue and leave as a clean, continuous waveform. Rounded
syllable lozenges, orbital dots, and ruled reading lines explain this job without
imitating an audio app or medical accessibility product. The result should feel
like a well-made personal reading instrument: precise, warm, and quietly odd.

## Palette

Light is the primary treatment; dark follows the reader's system preference.

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| Paper | `#F4F0E6` | `#151714` | page/background |
| Sheet | `#FFFDF7` | `#20231F` | elevated working surface |
| Ink | `#17201C` | `#F5F1E7` | primary copy |
| Quiet ink | `#59615C` | `#BFC6BF` | secondary copy |
| Vermilion | `#C43B22` | `#FF765E` | primary action and current word |
| Cobalt | `#2547B8` | `#8EA7FF` | links, focus, annotation |
| Acid lime | `#C9E45A` | `#D5ED70` | successful cue/memory signal |
| Ochre | `#A25D00` | `#FFC56A` | warning |
| Danger | `#A72D36` | `#FF8991` | destructive/error |

Ink/paper combinations exceed WCAG AA. Accent fills use ink-colored copy where
required; color is always paired with text, shape, or iconography.

## Type

No network fonts. Display and UI use the humanist system stack
`ui-rounded, "Arial Rounded MT Bold", "Avenir Next", system-ui`; reading copy
uses `Charter, "Bitstream Charter", Georgia, serif`. The contrast makes the
interface feel conversational while the selected passage feels book-like.
Body copy is at least 16 px (17 px in the extension reader) with 1.55–1.7 line
height. Scale: 14, 16/17, 20, 26, 38, and clamp(44, 8vw, 88) px.

## Spacing and shape

An 8 px base rhythm with 4 px for fine optical corrections. Main measures stay
between 45 and 72 characters. Controls are at least 44 px high with 10–16 px
radii. Independent glossary entries use thin ruled rows; panels are reserved for
meaningfully independent tools. The hero geometry uses circles, capsules, and a
single dark reading rail.

## Interaction grammar

- Vermilion means “speak/do”; cobalt means “inspect/edit”; lime means “remembered”.
- A saved cue snaps from scattered chips into a ruled glossary row.
- The current spoken chunk is a vermilion lozenge with an underline, supported
  by `aria-current`, never color alone.
- Add/edit surfaces originate beside the selected term; extension popovers use
  native dialog focus management semantics implemented in DOM.
- Empty, denied-permission, unsupported-speech, and offline-license states each
  give one concrete next action.

## Motion

UI transitions last 160–240 ms and animate only opacity/transform. The hero has
one slow, finite entrance: word particles settle onto the reading rail. There is
no looping ambient animation. With `prefers-reduced-motion: reduce`, all travel
is removed and state changes become instant or opacity-only.

## Original asset plan and provenance

The landing hero uses one generated editorial illustration: an abstract field of
paper-cut phoneme particles flowing through a vermilion cue gate and aligning on
a cobalt reading rail. UI icons and extension marks are hand-authored SVG using
the same capsule/circle grammar.

Prompt sheet:

- Subject: abstract pronunciation particles becoming one clear speech path.
- World: tactile editorial paper laboratory, no people.
- Materials: layered cut paper, matte ink, subtle fiber and embossed edges.
- Light/lens: soft raking studio light, slight axonometric view, crisp shadows.
- Palette words: warm paper, near-black ink, vermilion, cobalt, acid lime.
- Composition: landscape, visual mass on right, calm negative space on left,
  generous crop safety.
- Negative list: text, letters, logos, watermark, UI screenshot, microphones,
  headphones, human anatomy, glossy 3D, gradients, stock-photo styling.

Production prompt:

> Use case: stylized-concept. Asset type: landing-page hero illustration.
> Create an abstract pronunciation field: many small rounded paper particles and
> syllable-like capsules pass through one vermilion geometric cue gate, then
> align into a clear cobalt reading rail with a few acid-lime memory markers.
> Tactile editorial cut-paper construction, warm off-white ground, near-black
> structural lines, soft raking studio light, subtle fiber and embossed edges,
> slight axonometric perspective. Landscape composition with the main structure
> on the right and calm negative space on the left. No text, no letters, no
> watermark, no logos, no people, no microphones, no headphones, no anatomy,
> no glossy 3D, no generic gradient, no UI screenshot.

Generated with the factory image deployment (`/opt/fleet/lib/gen-image.sh`) on
2026-08-28. Original output and prompt sidecar live in `assets/src/`; optimized
WebP ships with the site. Generated imagery is disclosed in the footer.
