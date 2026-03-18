Context
The Command Center dashboard currently runs on a hardcoded mock array of 110 AIUseCaseItem objects. All 21 widget generators derive data from this in-memory array. The next phase is to build a real data pipeline that:

Ingests data from 7 diverse source entities (REST APIs, WebSockets, Excel files, email reports) into a centralized store
Aggregates it into a single unified entity per use case
Serves it to the existing dashboard with minimal frontend changes

The schema for the unified entity is still evolving as source integrations are defined. Scale: tens of thousands now, potentially millions long-term.

Database Decision: MongoDB (NoSQL) over SQL
Why MongoDB wins for this use case
FactorMongoDBSQLSchema evolutionAdd/remove fields freely, no migrationsEvery change = ALTER TABLE + migration file + potential table lockData shapeAIUseCaseItem is already a flat document with ~30 fields, many nullable — natural document fitWide table with many NULLs, or normalize into 5+ tables and join on every readMulti-source partial updates$set only the fields a source owns, leave the rest untouchedUPDATE with NULLs for unowned columns, or multi-table transactionsAggregationsPipeline handles all 21 generators (count, avg, group, filter)Equivalent SQL works too, but no advantage at this scaleIngestion from varied sourcesAccept semi-structured data, validate at app layer with ZodMust conform to rigid schema before insert
At millions of records — honest comparison
ConcernMongoDBPostgreSQLVerdictSchema evolutionNo-opMigrations + table locks on large tablesMongoDBSimple aggregations (count, avg, group)Fast with indexesFast with indexesTie — both need caching layer at millionsComplex analytics (window functions, CTEs)Limited $setWindowFieldsExcellentPostgreSQL (but we don't need these)Pagination at depthskip/limit degrades; need keyset paginationOFFSET/LIMIT degrades equally; need keyset paginationTiePre-aggregationManual (app-level cache or separate collection)Native MATERIALIZED VIEWPostgreSQL edge (but cache layer solves this for both)Full-text searchBasic; needs Elasticsearch at scaleBetter built-in tsvector; still needs ES at scaleSlight PostgreSQL edgeWrite throughputExcellentGoodSlight MongoDB edge
Bottom line: At millions, the performance strategies are identical regardless of database (caching, pre-aggregation, keyset pagination, search sidecar). MongoDB wins on schema flexibility, which is the #1 risk during the integration phase.
Where the LLM's SQL advice doesn't apply
The LLM conversation optimized for high-volume analytical dashboards (millions of rows, star schemas, OLAP). Our reality:

One entity type — no joins, no fact/dimension tables, no star schema
Simple aggregations — count by stage, average scores, filter by status
Schema is still being defined — schema change friction is the #1 risk

What the LLM got right (applies to both options below)

Separate ingestion from serving
Cache aggressively
Load widgets asynchronously (already implemented)
Incremental updates over full rebuilds


Two Architecture Options
Option A: MongoDB + In-Process Cache (Recommended to start)
Best for: Tens of thousands of records. Simpler to build and operate. Upgradeable to Option B.
7 Source Systems (APIs, WebSockets, Excel, Email)
    │
    ▼
┌─────────────────────────────────────┐
│  INGESTION LAYER                    │
│  Adapter per source → Normalizer    │
│  → Validator → MongoDB Writer       │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  MONGODB                            │
│  useCases / ingestionLogs /         │
│  sourceConfigs                      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  SERVING LAYER                      │
│  In-Process LRU Cache (lru-cache)   │
│       │ miss                        │
│  Generators (MongoDB aggregation    │
│  pipelines, same return types)      │
│       │                             │
│  Express Routes (unchanged URLs)    │
│  Socket.io (ingestion-driven push)  │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  REACT CLIENT (unchanged)           │
└─────────────────────────────────────┘
How it works:

Widget requests hit in-process LRU cache first (0ms). On miss, run MongoDB aggregation pipeline (5-50ms at 50K docs) and cache result.
Cache invalidation triggered by ingestion writer based on field → widget mapping.
Single Node.js process, no external cache dependency.

Performance ceiling: ~100K-200K documents before aggregation latency becomes noticeable (>100ms) on complex pipelines. At that point, upgrade to Option B.

Option B: MongoDB + Redis + Aggregation Worker (Scale-Ready)
Best for: Millions of records. Multiple server instances. Near-real-time requirements.
7 Source Systems (APIs, WebSockets, Excel, Email)
    │
    ▼
┌─────────────────────────────────────┐
│  INGESTION LAYER                    │
│  Adapter per source → Normalizer    │
│  → Validator → MongoDB Writer       │
│  → Change Event Emitter             │
└───────┬─────────────┬───────────────┘
        │             │
        ▼             ▼
┌──────────────┐  ┌─────────────────────────────────┐
│  MONGODB     │  │  AGGREGATION WORKER              │
│  useCases    │  │  (separate process or thread)     │
│  ingestion   │  │                                   │
│  Logs        │←─│  Listens to MongoDB Change        │
│  sourceConf  │  │  Streams (or ingestion events)    │
│              │  │                                   │
│              │  │  On change:                       │
│              │  │  1. Determine affected widgets     │
│              │  │  2. Run aggregation pipelines      │
│              │  │  3. Write results to Redis         │
│              │  │  4. Emit Socket.io push            │
│              │  └──────────────┬────────────────────┘
└──────────────┘                │
                                ▼
                  ┌─────────────────────────────────┐
                  │  REDIS                           │
                  │  Pre-computed widget results      │
                  │  TTL per widget tier              │
                  │  Shared across server instances   │
                  └──────────────┬────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────┐
│  SERVING LAYER (can be multiple Express instances)   │
│                                                      │
│  Widget endpoints → Read from Redis (<1ms)           │
│  Table endpoint → Query MongoDB with cursor-based    │
│                   pagination + cached counts          │
│  Socket.io → Push from aggregation worker            │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  REACT CLIENT (unchanged)           │
└─────────────────────────────────────┘
Key differences from Option A:
AspectOption AOption BCacheIn-process LRURedis (shared, persistent)AggregationOn-demand (on cache miss)Pre-computed by worker on data changeWidget readsCache hit or live DB queryAlways Redis read (<1ms)Server scalingSingle processMultiple Express instances behind load balancerTable paginationskip/limit (OK at 50K)Cursor-based keyset pagination (required at millions)Count queriesLive countDocuments()Cached in Redis (refreshed by worker)Real-time pushIngestion triggers Socket.io in-processWorker triggers Socket.io via Redis pub/subDependenciesmongodb, lru-cachemongodb, ioredis, worker process managerOperational complexityLowMedium (Redis + worker to monitor)
Additional Option B components:

Aggregation Worker — Separate process that watches for data changes (via MongoDB Change Streams or an event bus from the ingestion layer) and pre-computes all 21 widget results into Redis. Each widget result is stored as a JSON string with a key like widget:lifecycle-kpi and a TTL.
Cursor-based pagination — Instead of skip(offset).limit(pageSize), use keyset pagination:

   // First page
   db.useCases.find(filters).sort({ _id: 1 }).limit(pageSize)

   // Next page (using last document's _id)
   db.useCases.find({ ...filters, _id: { $gt: lastId } }).sort({ _id: 1 }).limit(pageSize)
Trade-off: Lose "jump to page N" — only forward/backward navigation. For a dashboard table, this is usually fine.

Cached counts — countDocuments() with filters at millions of rows is expensive. The worker pre-computes and caches counts for common filter combinations in Redis.
Optional: Elasticsearch — If full-text search across millions of documents with fuzzy matching, typo tolerance, or relevance scoring is needed, add Elasticsearch as a search sidecar. The worker syncs documents to ES on change. The /api/inventory search parameter queries ES instead of MongoDB's $text.


Shared Components (Both Options)
1. MongoDB Data Model
Collections
CollectionPurposeuseCasesOne document per AI use case. All 30+ fields flat at top level, plus _meta for source trackingingestionLogsAudit trail per ingestion run (source, records processed, errors). TTL: 90 dayssourceConfigsConfiguration per source adapter (type, schedule, field mappings, endpoint)
Document Schema (useCases)
{
  _id: ObjectId,
  useCaseId: "UC-12342",           // unique business key
  businessCaseId: "BCID-12342",

  // ... all existing AIUseCaseItem fields (flat, unchanged) ...
  useCaseName, lob, lifecycleStage, aiOnboardingStage, slaStatus,
  aiTechnology, status, severity, daysInCurrentStage, expectedSlaDays,
  approvalDays, isActive, agentName, driftScore, driftCategory,
  criticalAlerts, policyViolations, guardrailTriggers, monthlyCost,
  responsibleAIScore, accuracy, latency, hallucinationRate,
  alertType, alertStatus, owner, detectedTime

  _meta: {
    createdAt: ISODate,
    updatedAt: ISODate,
    version: 3,                     // optimistic concurrency
    sources: {
      "src-governance-api": {
        lastSyncedAt: ISODate,
        fieldsOwned: ["status", "severity", "aiOnboardingStage"],
        lastHash: "sha256:abc..."   // skip no-op writes
      },
      "src-model-monitor-ws": {
        lastSyncedAt: ISODate,
        fieldsOwned: ["driftScore", "accuracy", "latency"],
        lastHash: "sha256:def..."
      }
    }
  }
}
Key decisions:

Flat top-level fields — generators access item.lifecycleStage directly, works identically with MongoDB docs
_meta.sources tracks field ownership — each source only $sets its owned fields
_meta.version — optimistic concurrency prevents lost updates from concurrent adapters
lastHash — skip writes when data hasn't changed (critical for Excel/email full-dataset re-ingestion)

Index Strategy
IndexFieldsUsed ByUnique key{ useCaseId: 1 } uniqueAll ingestion upsertsLifecycle stage{ lifecycleStage: 1 }6 generators + table filterActive items{ isActive: 1 }5 generatorsAgent items{ agentName: 1 } partial (non-null)5 generatorsTable filters{ lob: 1, slaStatus: 1, status: 1, severity: 1 } compoundInventory tableText search{ useCaseName: "text", useCaseId: "text", businessCaseId: "text" }Table search
Source-to-Field Ownership
SourceTypeFields OwnedIdentity RegistryREST pollbusinessCaseId, useCaseId, useCaseName, lob, aiTechnologyGovernance APIREST pollstatus, severity, aiOnboardingStage, slaStatus, approvalDaysLifecycle TrackerREST polllifecycleStage, daysInCurrentStage, expectedSlaDaysModel MonitorWebSocketdriftScore, driftCategory, accuracy, latency, hallucinationRateRisk PlatformREST pollcriticalAlerts, policyViolations, guardrailTriggers, responsibleAIScoreFinance SystemExcel filemonthlyCostAlert SystemEmail/RESTalertType, alertStatus, owner, detectedTime
No two sources own the same field — conflicts prevented by design.

2. Ingestion Layer
Adapter Pattern
apps/server/src/ingestion/
  adapters/
    base.ts               # BaseAdapter interface
    rest-poller.ts         # Polls REST APIs on cron schedule
    websocket-listener.ts  # Persistent WS connections with reconnect
    excel-watcher.ts       # Watches directory for new Excel files
    email-parser.ts        # Polls IMAP inbox or watches .eml directory
  registry.ts             # Discovers, starts, stops adapters
  normalizer.ts           # Maps source schemas → AIUseCaseItem fields
  scheduler.ts            # node-cron wrapper for polling adapters
  writer.ts               # Batched MongoDB upserts with conflict resolution
Every adapter outputs NormalizedRecord[]:
typescriptinterface NormalizedRecord {
  useCaseId: string;                    // match key
  fields: Partial<AIUseCaseItem>;       // only fields this source owns
  sourceId: string;
  timestamp: Date;
}
Scheduling
Source TypeMechanismTypical IntervalREST pollersnode-cron1-5 minutesWebSocket listenersPersistent connection, exponential backoff reconnectReal-timeExcel file watcherchokidar + fallback cron scanOn file drop / 15 min scanEmail parserIMAP poll or filesystem watcher10 minutes
Write Path

Adapter emits NormalizedRecord[]
Normalizer validates against Zod schema (derived from AIUseCaseItem types)
Writer batches records into MongoDB bulkWrite with updateOne + $set per record
Only owned fields + _meta.sources.<sourceId>.lastSyncedAt are updated
Hash comparison skips no-op writes
Ingestion log document written to ingestionLogs
Affected widget caches are invalidated (field → widget mapping)
(Option B only) Change event emitted to aggregation worker

Error Handling

Transient failures: Retry 3x with exponential backoff, then log and move to next cycle
Parse errors: Log failed record, skip, continue batch
Adapter crashes: Registry restarts after 60s cooldown, disables after 5 consecutive crashes
Orphan records: If a source references a useCaseId that doesn't exist, logged and skipped (Identity Registry is the only source that creates new documents)


3. Generator Migration
Generators become async functions using MongoDB aggregation pipelines. Return types stay identical — zero frontend changes.
Current PatternMongoDB Equivalentinventory.filter(i => i.lifecycleStage === 'POC').length$match + $countinventory.reduce((sum, i) => sum + i.approvalDays, 0) / length$group + $avginventory.filter(i => i.alertType !== null)$match: { alertType: { $ne: null } }Group by field, count per group$group: { _id: '$field', count: { $sum: 1 } }
Route handlers change from let result = generator() to let result = await cache.getOrCompute(type, () => generator(db), ttl).
Widget Cache Tiers
TierTTLWidgetsHot (10-30s)Changes with real-time ingestionlifecycle-kpi, risk-stats, live-risk-events, production-growth, monthly-costWarm (60-120s)Analytical/trend, slight staleness OKAll other 16 widgets
Cache Invalidation Mapping (field → widgets)
Fields UpdatedWidgets InvalidatedlifecycleStage, daysInCurrentStage, expectedSlaDayslifecycle-kpi, lifecycle-funnel, stage-timeline, bottlenecks, production-growthstatus, severity, slaStatus, approvalDaysapproval-status, approval-time, bottlenecks, onboarding-trackerdriftScore, accuracy, latency, hallucinationRatemodel-performance, model-quality-risk, behavioral-drift, risk-score-breakdowncriticalAlerts, policyViolations, guardrailTriggers, responsibleAIScorelive-risk-events, responsible-ai-index, ai-index-trend, risk-score-breakdownmonthlyCostmonthly-costlob, aiTechnologyuse-cases-by-bu, tech-distribution, lifecycle-kpialertType, alertStatus, owner, detectedTimeattention-queue

4. API Changes
Widget endpoints — minimal change
Routes stay at GET /api/widgets/:type/data. Only internal change: handlers become async, generators read from DB through cache layer. Frontend is completely unchanged.
Inventory endpoint — server-side pagination
GET /api/inventory?page=1&pageSize=10&lifecycleStage=POC&search=fraud&sortBy=useCaseName&sortOrder=asc
Response adds pagination metadata:
json{
  "data": [...],
  "meta": {
    "timestamp": "...",
    "pagination": { "page": 1, "pageSize": 10, "totalItems": 487, "totalPages": 49 }
  }
}
Client impact: UseCasesTable.tsx switches from client-side to server-side filtering/pagination. URL param state model stays the same (useSearchParams), but changes trigger API calls instead of local filtering.
(Option B at millions): Switch to cursor-based pagination (?after=lastId instead of ?page=N). Counts cached in Redis.
Socket.io changes
Replace setInterval-based emission with ingestion-driven push: when data changes invalidate a widget cache, recomputed data is pushed to subscribed rooms. Any widget can opt into real-time via config dataSource.type: 'socket'.
New admin endpoints

GET /api/admin/ingestion/status — adapter health
GET /api/admin/ingestion/logs — paginated audit logs
POST /api/admin/ingestion/:sourceId/trigger — manual trigger


5. Seed Data Strategy

Seed script (apps/server/src/scripts/seed.ts): Takes existing 110-item mock array, adds _meta, inserts into MongoDB
Source onboarding: Connect one source at a time, starting with Identity Registry (creates core docs), then layer on field-owning sources
Dry-run mode: Each adapter supports processing without writing, outputting to ingestionLogs for validation
Validation: Zod schemas derived from @command-center/types validate every record before write


6. Performance Summary
ConcernOption AOption BWidget load speedLRU cache (0ms) → MongoDB (5-50ms)Redis (<1ms) alwaysTable paginationskip/limit with compound indexesCursor-based keyset + cached countsFull-text searchMongoDB $text indexElasticsearch sidecarIngestion throughputBatched bulkWrite, hash skipSame + Change Streams for workerServer scalingSingle processMultiple instances + Redis pub/subSchema changesJust add/remove fields, update ZodSameOperational overheadMongoDB onlyMongoDB + Redis + Worker

Dependencies
PackageOption AOption BmongodbYesYeszodYesYesnode-cronYesYeschokidarYesYesxlsx or exceljsYesYeslru-cacheYesNo (Redis replaces it)ioredisNoYes@elastic/elasticsearchNoOptional

Files Modified/Created
AreaFilesChangeNewapps/server/src/ingestion/* (8 files)Entire adapter frameworkNewapps/server/src/db/connection.tsMongoDB client initNewapps/server/src/scripts/seed.tsMock → MongoDB migrationNew (Option B)apps/server/src/workers/aggregation-worker.tsPre-computation workerModifiedapps/server/src/mocks/generators.ts → apps/server/src/data/generators.tsIn-memory → async MongoDB pipelinesModifiedapps/server/src/routes/widgets.tsCache layer, async handlersModifiedapps/server/src/routes/inventory.tsServer-side pagination/filteringModifiedapps/server/src/sockets/widget-events.tsIngestion-driven pushModifiedapps/server/src/index.tsInit MongoDB + ingestion on startupModifiedpackages/types/src/api.tsAdd pagination to ApiResponseModifiedapps/client/src/components/use-cases/UseCasesTable.tsxServer-side pagination/filteringModifiedapps/client/src/pages/UseCasesPage.tsxPass query params to API

Recommended Path
Start with Option A. Build the ingestion layer, MongoDB data model, generator migration, and cache. This handles tens of thousands of records with excellent performance and minimal operational complexity.
Upgrade to Option B when any of these triggers hit:

Collection exceeds ~200K documents and aggregation latency exceeds 100ms
Need to run multiple server instances (horizontal scaling)
Full-text search requirements exceed MongoDB $text capabilities
Real-time push latency from ingestion → client exceeds requirements

The upgrade path is clean: replace lru-cache with ioredis, extract aggregation logic into a worker process, switch pagination to cursor-based. The ingestion layer, data model, generators, and frontend remain unchanged.

Verification

Seed: Run seed script, verify db.useCases.countDocuments() = 110
Generators: Run each of 21 generators against DB, compare output to current in-memory generators (should produce identical data)
Widget endpoints: Hit all /api/widgets/:type/data endpoints, verify same response shapes
Table: Test /api/inventory with various filter/search/pagination params
Ingestion: Configure one test adapter (REST poller against a mock endpoint), verify documents update in MongoDB and widget caches invalidate
Frontend: Dashboard loads identically, table works with server-side pagination
(Option B) Redis populated with pre-computed results, worker responds to change events