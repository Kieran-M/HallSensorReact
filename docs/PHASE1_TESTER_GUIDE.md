# HallSim Phase 1 — Business Unit Test Guide

**Audience:** Business-unit reviewers exploring the hosted Phase 1 demo  
**Product:** HallSim (Diodes Incorporated) — magnet + Hall-effect sensor field simulator  
**Mode:** Self-guided (no facilitator required)

Replace the placeholder URL below with the live demo link you were given:

> **Demo URL:** `https://hallsensorreact.onrender.com` *(or the URL provided by the project team)*

Use a **desktop browser** (Chrome, Edge, or Firefox) at **≥ 1024 px** wide. A laptop or external monitor works best; phone/tablet layouts are secondary in Phase 1.

---

## 1. What Phase 1 is (and is not)

### In scope

| Area | What you can try |
|------|------------------|
| Application presets | Five ready-made motion + magnet + sensor setups |
| Custom setup | Choose motion type, magnet shape, and catalog sensor |
| 3D scene | Orbit/zoom the magnet path and sensor |
| Simulation | Compute magnetic field and device output over the motion |
| Charts | Field (Gauss) and device output vs position / angle / time |
| Sensor catalog | Browse Diodes Hall parts; filter; open datasheets |
| Magnet library | Materials and grades with typical remanence (Br) |
| Export | Download CSV and/or PDF of a completed run |

### Out of scope for Phase 1 (do not treat as bugs)

- Soft iron, shields, PCB, or package sensing-element (die) offsets
- Full linear Hall product portfolio (Phase 1 linear set is limited)
- Perfect open-drain / dual-output / multi-channel digital behaviour (simplified rail model)
- Coercivity / irreversible demagnetization under opposing fields
- Mobile-first UX

**In model (idealised):** Magpylib field from geometry + Br; grade sets typical Br; linear temp coefficient on Br; multipole bar/ring where the UI allows editable poles; digital Bop/Brp rails.

Treat HallSim as an **idealised Magpylib design explorer**, not a substitute for lab characterisation. The UI, CSV, and PDF carry the same Magpylib / evaluation disclaimer.

---

## 2. First 60 seconds — smoke check

1. Open the demo URL.
2. Confirm the page loads with Diodes / HallSim branding.
3. Check the header status:
   - **API Ready** (or equivalent green / ready state) → continue.
   - Offline / error → stop and report (simulation will not run).
4. You should see preset cards and a path into **Custom setup**.

If the UI looks unexpectedly dark, toggle the theme control in the header to **Light** (preference may be saved in the browser).

---

## 3. Suggested exploration path (~20–30 minutes)

Follow this order once, then free-explore.

| Step | Action | Why |
|------|--------|-----|
| A | Open **Linear, Slide-By** | Classic linear topology + **linear** Hall output |
| B | Click **Simulate**, wait for results | Confirms API + charts path |
| C | Use playback (play / scrub) | Confirms 3D ↔ chart linkage |
| D | Inspect both charts (field + device output) | Chart 2 / Chart 3 story |
| E | Export **CSV** and/or **PDF** | Confirms download path |
| F | Return home; open **Arc (Hinge)** | Digital latch / switch behaviour |
| G | Simulate again; note step-like digital output | Contrast with linear analog |
| H | From design view, **Browse catalog** | Filters + datasheet links |
| I | Optional: **Custom setup** wizard | Motion → magnet → sensor → create |
| J | Optional: Head-On, Rotation/Spin, Ring presets | Coverage of other motions |

---

## 4. Structured test cases

Use these as a checklist. Mark Pass / Fail / Notes. Failures should include browser, approximate time, and steps.

### TC-01 — Landing & branding

| | |
|--|--|
| **Steps** | Open demo URL; view landing. |
| **Expect** | HallSim / Diodes branding visible; preset cards shown; theme readable. |
| **Pass if** | No blank page; presets are clickable. |

### TC-02 — API health

| | |
|--|--|
| **Steps** | Note header API status on landing and after opening a preset. |
| **Expect** | Ready / online while using Simulate. |
| **Pass if** | Simulate is enabled when API is ready. |

### TC-03 — Linear Slide-By (linear Hall)

| | |
|--|--|
| **Steps** | Select **Linear, Slide-By** → **Simulate**. |
| **Expect** | 3D motion completes; field chart shows a bipolar-style pulse; device output is continuous (analog), not a hard digital step. |
| **Sensor** | AH49F (linear) |
| **Pass if** | Charts populate and playback moves a cursor / playhead. |

### TC-04 — Linear Head-On

| | |
|--|--|
| **Steps** | Select **Linear, Head-On** → **Simulate**. |
| **Expect** | Field magnitude / Bz-style ramp as the magnet approaches; analog output tracks. |
| **Pass if** | Results load without error. |

### TC-05 — Arc (Hinge) digital latch

| | |
|--|--|
| **Steps** | Select **Arc (Hinge)** → **Simulate**. |
| **Expect** | Angular motion; digital output shows clear high/low transitions; field chart may show Bop/Brp reference context for the switch. |
| **Sensor** | AH1711 (latch) |
| **Pass if** | Output looks stepped / digital, unlike TC-03. |

### TC-06 — Rotation / Spin

| | |
|--|--|
| **Steps** | Select **Rotation or Spin** → **Simulate**. |
| **Expect** | Full rotation; roughly periodic / sinusoidal field behaviour for a diametric cylinder. |
| **Pass if** | Charts cover a full turn without crashing. |

### TC-07 — Ring rotation

| | |
|--|--|
| **Steps** | Select **Rotation or Spin (Ring)** → **Simulate**. |
| **Expect** | Ring magnet rotates; **dipole** behaviour (not multi-pole encoder teeth). |
| **Pass if** | Simulation completes; UI does not claim multi-pole encoding. |

### TC-08 — Playback & 3D controls

| | |
|--|--|
| **Steps** | After any successful simulate: play/pause, scrub timeline, orbit/zoom the 3D view (mouse drag / scroll). |
| **Expect** | Scene updates with playback; camera remains usable. |
| **Pass if** | No frozen canvas; scrubbing moves the magnet pose. |

### TC-09 — Chart interaction

| | |
|--|--|
| **Steps** | On results charts: zoom in/out, pan if available, reset zoom; toggle series if legend controls exist. |
| **Expect** | Zoom/reset work; charts remain readable. |
| **Pass if** | Reset returns to a sensible full view. |

### TC-10 — Side panel edits + re-simulate

| | |
|--|--|
| **Steps** | In design view, change a magnet dimension or remanence (Br), or change motion endpoints slightly → **Simulate** again. |
| **Expect** | New results replace previous; charts update. |
| **Pass if** | Second run succeeds and differs when inputs change meaningfully. |

### TC-11 — Magnet material / grade

| | |
|--|--|
| **Steps** | In the control panel, change **Material** and **Grade**; note Br updates. |
| **Expect** | Grade list filters by material; typical Br fills in (still editable under Geometry). |
| **Pass if** | Switching NdFeB ↔ Ferrite (etc.) changes Br into a plausible range. |
| **Note** | Poles show as **2 (dipole)** and are fixed in Phase 1. |

### TC-12 — Sensor catalog browse

| | |
|--|--|
| **Steps** | **Browse catalog** → search a known PN (e.g. `AH49F`, `AH1711`) → filter by Hall type and package outline. |
| **Expect** | Results filter; no `TEST-LINEAR-HALL` / placeholder parts. |
| **Pass if** | Filters and search behave; count updates. |

### TC-13 — Datasheet links

| | |
|--|--|
| **Steps** | In catalog or selected-sensor summary, open **Datasheet**. |
| **Expect** | New tab to a Diodes datasheet PDF/URL. |
| **Pass if** | Link opens; no dead `about:blank`. Report any broken PN → datasheet pairs. |

### TC-14 — Supply VDD (linear)

| | |
|--|--|
| **Steps** | With a **linear** part selected, change **Supply VDD**, Simulate (or re-simulate). |
| **Expect** | Sensitivity / output scaling reflects ratiometric behaviour where applicable. |
| **Pass if** | App accepts the change and completes simulation. |

### TC-15 — Custom setup wizard

| | |
|--|--|
| **Steps** | From landing, start **Custom setup** → pick motion → magnet shape → sensor → create. |
| **Expect** | Lands in design workspace with your choices; Simulate works after defaults. |
| **Pass if** | Wizard completes; note that curves may be less “tuned” than presets until you edit geometry. |

### TC-16 — Export CSV / PDF

| | |
|--|--|
| **Steps** | After a successful run, export CSV and PDF. |
| **Expect** | Files download; content references magnet / sensor / run data. |
| **Pass if** | Files open; not empty. |

### TC-17 — Theme toggle

| | |
|--|--|
| **Steps** | Toggle Light / Dark; reload the page. |
| **Expect** | Preference persists; logos/contrast remain usable in both. |
| **Pass if** | No unreadable text or missing controls. |

### TC-18 — Browser refresh mid-session

| | |
|--|--|
| **Steps** | Mid-design or mid-results, refresh the browser. |
| **Expect** | App returns to a clean landing / default state (Phase 1 may not restore unsaved session). |
| **Pass if** | App recovers cleanly without a hard error page. |

---

## 5. Preset quick reference

| Preset | Motion | Typical story | Default sensor |
|--------|--------|---------------|----------------|
| Linear, Slide-By | Linear translate | Small N35 puck past latch (~2.8 mm gap) → operate/release | AH1712 (latch) |
| Linear, Head-On | Linear approach | Proximity: far OFF → near ON | AH1382 (unipolar) |
| Arc (Hinge) | Hinge / arc | Lid open OFF → closed ON | AH1712 (latch) |
| Rotation or Spin | Rotate 360° | Off-axis diametric disc → sinusoidal Bz | AH49F (linear) |
| Rotation or Spin (Ring) | Rotate 360° | 12-pole ring, sensor under rim → 12 Bz cycles | AH49F (linear) |

---

## 6. Known limitations (please read once)

1. **Magpylib ideal magnets** — uniform polarization; no soft iron or shielding. Fields are simulated, not measured.  
2. **Hall-plate offset** — when a datasheet Sensor Location is known, Magpylib samples at package centre + rotated die offset (not only the UI XYZ). Parts without a known offset still sample at the package centre.  
3. **Field drivers** — geometry + remanence (Br) + optional linear temperature demag of Br. Material/grade set typical Br (and temp coeff); coercivity is not used in B.  
4. **Poles** — bar / diametric ring / axial ring support valid multipole counts; cylinders and spheres remain 2-pole.  
5. **Digital model** — typical Bop/Brp; simplified output rails (open-drain / dual-output parts are not fully represented).  
6. **Sensing axis** — catalog sensing axis is rotated by sensor orientation into world before projecting B.  
7. **Linear catalog** — Phase 1 includes a small linear set (e.g. AH49F, AH850x), plus a larger digital switch catalog.  
8. **Custom setup** — intentional starting point; presets are better for first-look “application example” curves.  
9. **Exports** — CSV/PDF include setup metadata and the Magpylib evaluation disclaimer.  
10. **Package meshes** — SOT23 / SIP-3 (TO-92S) / DFN1010 / DFN1410 / DFN2020 use official Diodes STEP→GLB assets where available; SC59 and SOT553/TSOT25 remain procedural (no public STEP).  
11. **Hinge motion** — pivot fixed at (0,0,0); Origin Position is the magnet centre at 0° and may include X/Y/Z offset (TIMSS-style).

If something looks wrong **within** these limits, still report it — but label whether you believe it is a **bug** or a **Phase 1 scope gap**.

---

## 7. What to report

Please send feedback with:

| Field | Example |
|-------|---------|
| Tester name / team | |
| Date / time | |
| Browser + OS | Edge 130 / Windows 11 |
| Demo URL used | |
| Test case ID | TC-05 |
| Severity | Blocker / Major / Minor / Suggestion |
| Steps to reproduce | 1… 2… 3… |
| Expected vs actual | |
| Screenshot / screen recording | Optional but very helpful |
| Console errors (F12 → Console) | Optional |

**Blocker examples:** cannot load app, API always offline, Simulate always fails, charts empty after success toast, datasheets universally broken.  
**Suggestion examples:** copy clarity, extra filters, more presets, mobile layout.

---

## 8. Sign-off checklist (optional)

For teams collecting structured feedback:

- [ ] TC-01 Landing  
- [ ] TC-02 API health  
- [ ] TC-03 Slide-By  
- [ ] TC-05 Hinge digital  
- [ ] TC-08 Playback  
- [ ] TC-12 Catalog  
- [ ] TC-13 Datasheet  
- [ ] TC-16 Export  
- [ ] Skimmed Section 6 limitations  
- [ ] Feedback submitted  

**Minimum viable review:** TC-01, TC-02, TC-03, TC-05, TC-12, TC-16.

---

## 9. Support contact

Route issues to the HallSim project owner / engineering contact who shared this demo (include the report table from Section 7).

---

*Document version: Phase 1 business-unit test guide · HallSim*
