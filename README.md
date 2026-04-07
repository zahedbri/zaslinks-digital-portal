# zaslinks-digital-portal
A student job and internship searching portal and job board aggregator.

## Simple plan: build a budget short-stay finder app (Airbnb-like)

If you want a **simple web app** to find nearby rental houses/hostels/dorms by radius and map, this is a practical beginner-friendly setup.

### 1) Tech stack (simple and low-cost)
- **Frontend:** React + Vite + Tailwind CSS
- **Map:** Leaflet + OpenStreetMap tiles (free)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + PostGIS (for fast radius searches)
- **Auth (optional first version):** Clerk or Firebase Auth
- **Hosting:** Vercel (frontend) + Render/Railway (backend + DB)

### 2) Core features for MVP
1. Search by current location or typed city
2. Filter by radius (1 km, 3 km, 5 km, 10 km)
3. Budget filter (min/max price per night)
4. Property type filter (house, hostel, dorm)
5. Map markers + list view
6. Basic property detail page (images, price, amenities, contact)

### 3) Data model (minimal)
`listings` table:
- id
- title
- type (`house`, `hostel`, `dorm`)
- price_per_night
- latitude
- longitude
- address
- city
- amenities (JSON)
- photos (JSON)
- created_at

### 4) Radius search query (PostGIS example)
Use geospatial indexes so nearby search is fast:

```sql
-- One-time setup
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE listings
ADD COLUMN geom GEOGRAPHY(POINT, 4326);

UPDATE listings
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography;

CREATE INDEX idx_listings_geom ON listings USING GIST (geom);

-- API query example: nearby + budget + type
SELECT id, title, type, price_per_night, latitude, longitude, address
FROM listings
WHERE ST_DWithin(
  geom,
  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
  $3
)
AND price_per_night BETWEEN $4 AND $5
AND ($6::text IS NULL OR type = $6)
ORDER BY price_per_night ASC
LIMIT 100;
```

### 5) Example API design
- `GET /api/listings/nearby?lat=..&lng=..&radius=3000&min=10&max=60&type=hostel`
- `GET /api/listings/:id`
- `POST /api/listings` (host adds a listing)

### 6) Frontend flow
1. Get user location via browser geolocation
2. Show map centered on user
3. Call nearby endpoint whenever radius/filter changes
4. Render results in both marker map + side list
5. Clicking list item highlights map marker

### 7) Suggested project structure
```text
budget-stay-app/
  client/ (React)
  server/ (Express)
  db/
    schema.sql
    seed.sql
```

### 8) Basic requirements checklist
- Responsive UI (mobile-first)
- Input validation for filters
- Server-side pagination
- Image compression for uploads
- Rate limiting on public APIs
- Basic logs + error handling

### 9) 7-day beginner implementation roadmap
- **Day 1:** Setup React + Express + PostgreSQL
- **Day 2:** Create listings schema + seed sample data
- **Day 3:** Build nearby API with PostGIS radius search
- **Day 4:** Add map + markers in frontend
- **Day 5:** Add filters (radius, price, type)
- **Day 6:** Property details page + polish
- **Day 7:** Deploy and test on mobile

### 10) Cost-saving ideas (important for cheaper-than-Airbnb goal)
- Prioritize hostels/dorm inventory with low nightly rates
- Add “lowest total cost” sorting (nightly rate + service fee)
- Show transparent fee breakdown before checkout
- Encourage longer stays with weekly discounts

---
If you want, next step can be a **copy-paste starter template** for:
- React map page,
- Express nearby endpoint,
- SQL schema + seed,
so you can run a working MVP quickly.
