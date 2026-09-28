-- Nawi Saadi Trip Portal — the photo-guide block.
--
-- A step-by-step photo walkthrough: "leave through Exit 3" (photo), "turn left
-- past the café" (photo), "your driver waits at pillar 12" (photo), ending at a
-- pin on the map. Stored like every other block, in the jsonb payload
-- ({ heading, text, steps: [{ path, text }], latitude, longitude,
-- locationName }), so adding the kind is the whole schema change.
--
-- Applied to the live project on 2026-09-28 as `trip_portal_guide_block`.
alter type trip_block_kind add value if not exists 'guide';
