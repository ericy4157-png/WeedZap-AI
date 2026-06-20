# WeedSense AI

Full-stack weed identification and contextual herbicide recommendation platform. Upload a weed photo, provide field context (crop, location, growth stage), and receive ranked treatment guidance.

Built on the [Weed-AI](https://github.com/Weed-AI/Weed-AI) ecosystem for future ML training with WeedCOCO datasets.

## Architecture

```
Browser → Next.js (BFF) → FastAPI (ML) → species prediction
                        → Prisma/Postgres or JSON → ranked recommendations
                        → Supabase Storage (optional) → image upload
```

| Service | Stack | Role |
|---------|-------|------|
| Frontend | Next.js 15, Tailwind, shadcn/ui, Framer Motion | UI, orchestration, recommendations |
| Backend | FastAPI, PyTorch-ready ML layer | Image classification (mock in MVP) |
| Database | PostgreSQL via Supabase + Prisma | Weed/herbicide knowledge base |
| Storage | Supabase Storage | Uploaded images |

## Quick Start (Local)

### Prerequisites

- Node.js 20+
- Python 3.11+
- (Optional) Supabase project for Postgres + Storage

### 1. Install dependencies

```bash
cd weedsense
npm install
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment variables

Copy example env files:

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

**Minimum for local demo** (no Supabase required — uses JSON knowledge fallback):

```env
# frontend/.env.local
ML_API_URL=http://localhost:8000
```

**Full setup with Supabase:**

```env
# frontend/.env.local
DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres?pgbouncer=true"
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
ML_API_URL=http://localhost:8000
```

```env
# backend/.env
FRONTEND_URL=http://localhost:3000
PORT=8000
```

### 3. Database (optional)

If `DATABASE_URL` is set:

```bash
npm run db:push      # create tables
npm run db:seed      # load knowledge/weed_database.json
```

Without a database, recommendations load from `knowledge/weed_database.json` automatically.

### 4. Run services

**Terminal 1 — ML API:**

```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. uvicorn api.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. **Database:** Copy the connection string (use **Transaction pooler** for Vercel) into `DATABASE_URL`
3. **Storage:** Create a public bucket named `weed-uploads`
4. **API keys:** Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to frontend env

Run migrations and seed:

```bash
npm run db:push
npm run db:seed
```

## Deployment

### Frontend — Vercel

1. Import repo, set **Root Directory** to `weedsense/frontend`
2. Add environment variables from `frontend/.env.example`
3. Deploy — `vercel.json` installs from monorepo root

### Backend — Railway

1. Create new project from repo
2. Set **Root Directory** to `weedsense/backend`
3. Add `FRONTEND_URL` = your Vercel domain
4. Railway uses `railway.toml` start command and `/health` check

### Connect services

Set `ML_API_URL` on Vercel to your Railway backend URL (e.g. `https://weedsense-api.up.railway.app`).

## API Reference

### `POST /predict` (FastAPI)

Multipart image upload. Returns:

```json
{
  "species": "Palmer Amaranth",
  "confidence": 0.974,
  "bounding_boxes": [[120, 80, 340, 290]]
}
```

### `POST /api/analyze` (Next.js BFF)

Form fields: `image`, `crop`, `location`, `growthStage`

Returns full analysis with ranked herbicide recommendations filtered by context.

## Knowledge Base

Weed data lives in [`knowledge/weed_database.json`](knowledge/weed_database.json) (8 species seeded):

- Palmer Amaranth, Waterhemp, Giant Ragweed, Johnsongrass
- Horseweed, Giant Foxtail, Common Lambsquarters, Kochia

Each entry includes scientific name, family, life cycle, crops affected, herbicides with contextual filters (crop, location, growth stage), resistance warnings, and safety notes.

## Replacing Mock ML with Weed-AI Trained Model

The MVP uses a deterministic mock classifier. To train on real data:

1. Browse and download WeedCOCO datasets from [weed-ai.sydney.edu.au](https://weed-ai.sydney.edu.au)
2. Clone [Weed-AI/Weed-AI](https://github.com/Weed-AI/Weed-AI) and install: `pip install -e .`
3. Adapt the [`weed_ai_yolov5.ipynb`](https://github.com/Weed-AI/Weed-AI/blob/master/weed_ai_yolov5.ipynb) conversion pipeline for YOLOv8:

   ```bash
   pip install ultralytics
   yolo detect train data=weedcoco.yaml model=yolov8m.pt imgsz=1280 epochs=30
   ```

4. Place `best.pt` in `backend/ml/models/`
5. Update `backend/ml/classifier.py` to load the model instead of mock predictions

## Project Structure

```
weedsense/
├── frontend/          Next.js app (upload, results, BFF API)
├── backend/           FastAPI ML service
├── database/          Prisma schema + seed script
└── knowledge/         weed_database.json (source of truth)
```

## Disclaimer

Herbicide recommendations are for informational purposes only. Always consult local extension offices, certified crop advisors, and product labels before applying chemicals. Regulations vary by state, crop, and season.

## License

MIT
