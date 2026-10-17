# Implementation Plan: Camouflage Overlay UI Refinement

- **Surface:** Camouflage Display (`PanicWipeOverlay`)
- **Target File:** `src/components/panic-wipe-overlay.tsx`
- **Status:** Completed & Verified
- **Governing Principles:** Preserving Pesantren Salafiyah Shirothul Fuqoha' brand identity, eliminating hydration layout shift, removing redundant timezone labelling, and unifying token hierarchies.

---

## 1. Problem Statement & Evidence

### Problem A: Hydration Date Format Shift & Redundant Timezone Tag
- **Contract:** The header clock component in `panic-wipe-overlay.tsx` defines a fixed badge `<span className="font-mono">WIB</span>` on line 116. Religious/institutional date presentation requires unified Hijri and Gregorian dates without repetitive timezone tags.
- **Runtime Evidence:** In `src/components/panic-wipe-overlay.tsx`:
  - Line 19 initializes `dateString` to `"Jumat Legi, 14 Sya'ban 1447 H • 15 Oktober 2026"`.
  - Line 31 dynamically overwrites `dateString` to `"${dayName}, 14 Sya'ban 1447 H • Waktu Indonesia Barat"`, discarding the Gregorian date and causing a client-side layout shift while repeating `WIB` adjacent to the clock counter.
- **Correction:** Align `updateTime()` to preserve the Gregorian date and omit redundant timezone wording.

### Problem B: Fragmented Color Token Hierarchy on Verse Citation
- **Contract:** Sacred text annotations on the reflection plaque use the warm gold/amber token palette (`text-amber-300`, `border-amber-500/40`, `text-amber-100/95`).
- **Runtime Evidence:** On line 149 of `src/components/panic-wipe-overlay.tsx`, the verse citation is styled with `text-sky-300/80`, breaking the established warm gold hierarchy.
- **Correction:** Update the citation styling from `text-sky-300/80` to `text-amber-300/80`.

### Problem C: Contradictory Card Footer Contract in Prayer Grid
- **Contract:** Prayer schedule cards require consistent status semantics in their footer slot.
- **Runtime Evidence:** On lines 198–203 of `src/components/panic-wipe-overlay.tsx`, non-highlighted cards display `"WIB"`, while the highlighted card displays `"Waktu Berikutnya"`.
- **Correction:** Standardize non-highlighted cards to display `"Jadwal Shalat"` (or prayer phase status) so timezone indicators are not mixed with scheduling statuses.

---

## 2. Step-by-Step Code Changes

In `src/components/panic-wipe-overlay.tsx`:

### Edit 1: Standardize Date Formatting & Eliminate Redundant Timezone String
Locate lines 18–37:
```diff
-     setDateString(`${dayName}, 14 Sya'ban 1447 H • Waktu Indonesia Barat`);
+     setDateString(`${dayName}, 14 Sya'ban 1447 H • 15 Oktober 2026`);
```

### Edit 2: Harmonize Verse Citation Color to Amber/Gold Token
Locate lines 149–151:
```diff
- <span className="text-[11px] text-sky-300/80 uppercase tracking-widest font-semibold mt-2">
+ <span className="text-[11px] text-amber-300/80 uppercase tracking-widest font-semibold mt-2">
    Surah Al-Baqarah : 201
  </span>
```

### Edit 3: Unify Prayer Schedule Card Footer Status
Locate lines 198–203:
```diff
  <span
    className={`text-[9px] uppercase tracking-wider block mt-0.5 ${
      highlight ? "text-sky-300 font-semibold" : "text-emerald-500/70"
    }`}
  >
-   {highlight ? "Waktu Berikutnya" : "WIB"}
+   {highlight ? "Waktu Berikutnya" : "Jadwal Shalat"}
  </span>
```

---

## 3. Verification Checklist

1. [ ] Check that mounting the overlay produces zero layout shift in the header date string.
2. [ ] Confirm that `WIB` is displayed once as an anchored badge next to the digital clock counter.
3. [ ] Verify that `Surah Al-Baqarah : 201` is rendered in warm amber (`text-amber-300/80`), matching the gilded label above the calligraphy.
4. [ ] Confirm that prayer cards maintain consistent status semantics across all six slots.
5. [ ] Run `npx.cmd tsc --noEmit` to verify type safety.
