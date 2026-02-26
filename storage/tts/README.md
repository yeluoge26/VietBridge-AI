# VietBridge AI - TTS Audio Assets

Pre-generated Vietnamese TTS audio files for offline/embedded use in mobile apps.

## Voice

- **Engine**: Microsoft Edge TTS (via `edge-tts` Python package)
- **Voice**: `vi-VN-HoaiMyNeural` (Vietnamese female, natural)
- **Format**: MP3, 16kHz
- **Generated**: 2026-02-26

## Directory Structure

```
storage/tts/
  courses/     — 1510 files (Course lessons, keyed by Course.id)
  scenes/      —  687 files (Scene phrases, keyed by ScenePhrase.id)
  knowledge/   —  105 files (Knowledge entries with Vietnamese text, keyed by KnowledgeEntry.id)
```

## File Naming

Each MP3 file is named by its database record ID:
- `courses/{Course.id}.mp3` — Vietnamese pronunciation of `Course.vietnamese`
- `scenes/{ScenePhrase.id}.mp3` — Vietnamese pronunciation of `ScenePhrase.vi`
- `knowledge/{KnowledgeEntry.id}.mp3` — Vietnamese pronunciation of `KnowledgeEntry.valueVi`

## Mobile App Integration

These files are intended to be bundled into the mobile app (Capacitor/Android APK)
to provide instant TTS playback without incurring API costs at runtime.

### Recommended approach:
1. Copy the `courses/`, `scenes/`, `knowledge/` directories into `h5/public/tts/`
2. In the H5 app, play audio via `<audio src="/tts/courses/{id}.mp3">`
3. For records without a pre-generated file, fall back to the `/api/tts` endpoint

## Regeneration

To regenerate all TTS files:

```bash
# Requires: pip install edge-tts psycopg2-binary
# Requires: PostgreSQL running (Docker: docker start vietbridge-pg)
python scripts/batch-tts-edge.py
```

The script is idempotent — existing files are skipped (cached).

## NLS (Alibaba Cloud) Alternative

The app also supports Alibaba Cloud NLS TTS with voice "Tien" (Vietnamese female).
To use NLS instead:
1. Set `NLS_APPKEY` and `NLS_TOKEN` in `.env.local`
2. Upgrade NLS to commercial tier (free trial expired)
3. Run: `npx tsx scripts/batch-tts.ts`
