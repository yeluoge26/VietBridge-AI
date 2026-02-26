"""
VietBridge AI — Batch TTS Generator (Edge TTS)
Synthesizes all Vietnamese text from PostgreSQL into MP3 files.
Uses Microsoft Edge TTS (free, high quality, no API key needed).

Usage: python scripts/batch-tts-edge.py
Voices:
  Vietnamese: vi-VN-HoaiMyNeural (female, natural)
  Chinese:    zh-CN-XiaoxiaoNeural (female, natural)
"""

import asyncio
import os
import sys
import hashlib
import time
from pathlib import Path

try:
    import edge_tts
except ImportError:
    print("ERROR: edge-tts not installed. Run: pip install edge-tts")
    sys.exit(1)

try:
    import psycopg2
except ImportError:
    print("ERROR: psycopg2 not installed. Run: pip install psycopg2-binary")
    sys.exit(1)

# ── Configuration ──
VOICE_VI = "vi-VN-HoaiMyNeural"   # Vietnamese female
VOICE_ZH = "zh-CN-XiaoxiaoNeural" # Chinese female (for reference)
RATE = "+0%"       # speech rate
VOLUME = "+0%"     # volume

# Directories
BASE_DIR = Path(__file__).resolve().parent.parent / "storage" / "tts"
COURSE_DIR = BASE_DIR / "courses"
SCENE_DIR = BASE_DIR / "scenes"
KNOWLEDGE_DIR = BASE_DIR / "knowledge"
CACHE_DIR = BASE_DIR  # hash-based cache

# Rate limiting
DELAY_MS = 200  # ms between requests
BATCH_SIZE = 10 # concurrent synthesis

# Stats
stats = {"total": 0, "cached": 0, "generated": 0, "failed": 0}

# ── Database ──
def get_db_url():
    """Read DATABASE_URL from .env.local, strip Prisma-only params."""
    env_file = Path(__file__).resolve().parent.parent / ".env.local"
    if not env_file.exists():
        print(f"ERROR: {env_file} not found")
        sys.exit(1)
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line.startswith("DATABASE_URL="):
            url = line.split("=", 1)[1].strip('"').strip("'")
            # psycopg2 doesn't support Prisma's ?schema= param
            if "?" in url:
                url = url.split("?")[0]
            return url
    print("ERROR: DATABASE_URL not found in .env.local")
    sys.exit(1)

def fetch_records(conn):
    """Fetch all records needing TTS from database."""
    records = []

    # 1. Courses — vietnamese text
    with conn.cursor() as cur:
        cur.execute('SELECT id, vietnamese FROM "Course" WHERE vietnamese IS NOT NULL AND vietnamese != \'\'')
        rows = cur.fetchall()
        for row in rows:
            records.append({"id": row[0], "text": row[1], "category": "courses"})
    print(f"  Courses: {len([r for r in records if r['category']=='courses'])}")

    # 2. Scene Phrases — vi text
    with conn.cursor() as cur:
        cur.execute('SELECT id, vi FROM "ScenePhrase" WHERE active = true AND vi IS NOT NULL AND vi != \'\'')
        rows = cur.fetchall()
        for row in rows:
            records.append({"id": row[0], "text": row[1], "category": "scenes"})
    print(f"  Scenes:  {len([r for r in records if r['category']=='scenes'])}")

    # 3. Knowledge — valueVi text
    with conn.cursor() as cur:
        cur.execute('SELECT id, "valueVi" FROM "KnowledgeEntry" WHERE "valueVi" IS NOT NULL AND "valueVi" != \'\'')
        rows = cur.fetchall()
        for row in rows:
            records.append({"id": row[0], "text": row[1], "category": "knowledge"})
    print(f"  Knowledge: {len([r for r in records if r['category']=='knowledge'])}")

    return records

# ── TTS ──
def get_cache_hash(text: str, voice: str) -> str:
    return hashlib.sha256(f"vi:{voice}:{text}".encode()).hexdigest()

def get_category_dir(category: str) -> Path:
    dirs = {"courses": COURSE_DIR, "scenes": SCENE_DIR, "knowledge": KNOWLEDGE_DIR}
    return dirs.get(category, BASE_DIR)

async def synthesize_one(record: dict, semaphore: asyncio.Semaphore):
    """Synthesize a single record."""
    stats["total"] += 1
    text = record["text"].strip()
    if not text:
        return

    cat_dir = get_category_dir(record["category"])
    named_path = cat_dir / f"{record['id']}.mp3"

    # Skip if already exists
    if named_path.exists() and named_path.stat().st_size > 100:
        stats["cached"] += 1
        return

    # Check hash cache
    h = get_cache_hash(text, VOICE_VI)
    cache_path = CACHE_DIR / f"{h}.mp3"
    if cache_path.exists() and cache_path.stat().st_size > 100:
        # Copy from cache
        import shutil
        shutil.copy2(cache_path, named_path)
        stats["cached"] += 1
        return

    # Synthesize
    async with semaphore:
        try:
            communicate = edge_tts.Communicate(text, VOICE_VI, rate=RATE, volume=VOLUME)
            await communicate.save(str(named_path))

            # Verify file was created and has content
            if named_path.exists() and named_path.stat().st_size > 100:
                # Also save to hash cache
                import shutil
                shutil.copy2(named_path, cache_path)
                stats["generated"] += 1
            else:
                stats["failed"] += 1
                if named_path.exists():
                    named_path.unlink()

            # Rate limit
            await asyncio.sleep(DELAY_MS / 1000)

        except Exception as e:
            stats["failed"] += 1
            err_msg = str(e)[:100]
            if stats["failed"] <= 5:
                print(f"    FAIL [{record['id'][:8]}]: {err_msg}")
            elif stats["failed"] == 6:
                print(f"    ... suppressing further error messages")

async def run_batch(records: list):
    """Run batch synthesis with concurrency control."""
    semaphore = asyncio.Semaphore(BATCH_SIZE)
    total = len(records)

    # Process in chunks for progress reporting
    chunk_size = 100
    for i in range(0, total, chunk_size):
        chunk = records[i:i + chunk_size]
        tasks = [synthesize_one(r, semaphore) for r in chunk]
        await asyncio.gather(*tasks)

        done = min(i + chunk_size, total)
        elapsed = stats["generated"] + stats["cached"] + stats["failed"]
        print(f"  Progress: {done}/{total} — generated: {stats['generated']}, cached: {stats['cached']}, failed: {stats['failed']}")

async def main():
    print("=" * 60)
    print("VietBridge AI — Batch TTS Generator (Edge TTS)")
    print("=" * 60)
    print(f"Voice: {VOICE_VI}")
    print(f"Output: {BASE_DIR}\n")

    # Ensure directories
    for d in [BASE_DIR, COURSE_DIR, SCENE_DIR, KNOWLEDGE_DIR, CACHE_DIR]:
        d.mkdir(parents=True, exist_ok=True)

    # Connect to database
    db_url = get_db_url()
    print(f"Connecting to database...")
    conn = psycopg2.connect(db_url)
    print("  Connected!\n")

    # Fetch records
    print("Fetching records...")
    records = fetch_records(conn)
    conn.close()
    print(f"\nTotal records: {len(records)}\n")

    if not records:
        print("No records to process.")
        return

    # Quick test with first record
    print("Testing Edge TTS with first record...")
    test_rec = records[0]
    test_text = test_rec["text"][:50]
    print(f"  Text: {test_text}...")
    try:
        communicate = edge_tts.Communicate("Xin chào", VOICE_VI)
        test_path = str(BASE_DIR / "_test.mp3")
        await communicate.save(test_path)
        size = os.path.getsize(test_path)
        os.unlink(test_path)
        print(f"  Test OK! ({size} bytes)\n")
    except Exception as e:
        print(f"  Test FAILED: {e}")
        print("  Edge TTS may not be available. Check your network connection.")
        return

    # Run batch synthesis
    start = time.time()
    print("Starting batch synthesis...")
    await run_batch(records)
    elapsed = time.time() - start

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total records:  {stats['total']}")
    print(f"Already cached: {stats['cached']}")
    print(f"Generated:      {stats['generated']}")
    print(f"Failed:         {stats['failed']}")
    print(f"Time:           {elapsed:.1f}s ({elapsed/60:.1f}min)")
    print(f"\nMP3 files saved to: {BASE_DIR}")
    print(f"  courses/    — {len(list(COURSE_DIR.glob('*.mp3')))} files")
    print(f"  scenes/     — {len(list(SCENE_DIR.glob('*.mp3')))} files")
    print(f"  knowledge/  — {len(list(KNOWLEDGE_DIR.glob('*.mp3')))} files")

if __name__ == "__main__":
    asyncio.run(main())
