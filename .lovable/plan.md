## Simplify Capture Quality screen

Edit `src/pages/detect/CaptureDetail.tsx`:

1. **Remove the clickable clean-modality cards section** (Voice resonance, Breath capacity, Face sweep, GEM HRV). Drop the `CLEAN` array, the `CleanModality` type, and the `Mic`/`Wind`/`Smile`/`Activity`/`CheckCircle2` imports that only powered them.
2. Replace it with a single compact summary line under the warned Tongue card, e.g. "Voice, Breath, Face, and GEM HRV all captured cleanly." (muted text, no chevron, not interactive).
3. Also remove the wildcard route `detect/latest/capture/:modality` from `src/App.tsx` since nothing links to it anymore.
4. Keep everything else intact: header, warned Tongue card with Retake/Tutorial actions, "Capture health over time" 6-week chart, Practice & tutorials card, Coach prompt.

No business logic changes; UI-only simplification.