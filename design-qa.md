**Design QA**

- Source visual truth: `/var/folders/p2/fgctsmhj63df_flqdq5f1zn80000gn/T/TemporaryItems/NSIRD_screencaptureui_3gpUo4/Screenshot 2026-06-14 at 15.40.21.png`
- Implementation target: `https://tlgec.github.io/Demo/`
- Intended viewports: desktop 1280 x 720, tablet 768 x 1024, mobile 390 x 844
- State: Demo v3.1 home, presentation mode on and off, guided stages, workflow entry
- Full-view comparison evidence: blocked until commit `5077a52` is published
- Focused comparison evidence: blocked until commit `5077a52` is published

**Findings**

- The prior production build used a checkbox inside the global survey-save handler, causing repeated full-app redraws.
- The prior guided-tour start performed calculation, proposal refresh and local save before navigation.
- The prior headline and browser-restored scroll position could clip the opening message.
- The prior delayed event rebinding could restore older, heavier handlers after the page appeared ready.

**Patches Made**

- Replaced the checkbox with an isolated `aria-pressed` presentation button.
- Removed save and output calculation from tour startup.
- Added staged sample preparation only when entering workflow screens.
- Removed delayed control rebinding.
- Added responsive headline sizing and deterministic opening scroll position.
- Added version and offline-cache rotation to Demo v3.1.

**Remaining Gate**

- Publish commit `5077a52`, capture the rendered desktop and mobile states, exercise all primary controls, and compare against the source screenshot.

final result: blocked
