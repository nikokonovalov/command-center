Context
The Command Center dashboard currently runs on a hardcoded mock array of 110 AIUseCaseItem objects. All 21 widget generators derive data from this in-memory array. The next phase is to build a real data pipeline that:

Ingests data from 7 diverse source entities (REST APIs, WebSockets, Excel files, email reports) into a centralized store
Aggregates it into a single unified entity per use case
Serves it to the existing dashboard with minimal frontend changes

The schema for the unified entity is still evolving as source integrations are defined. Scale target: tens of thousands of use cases.

Database Decision: MongoDB (NoSQL) over SQL
Why MongoDB wins for this use case
FactorMongoDBSQLSchema evolutionAdd/remove fields freely, no migrationsEvery change = ALTER TABLE + migration file + rollback planData shapeAIUseCaseItem is already a flat document with ~30 fields, many nullable — natural document fitWide table with many NULLs, or normalize into 5+ tables and join on every readMulti-source partial updates$set only the fields a source owns, leave the rest untouchedUPDATE with NULLs for unowned columns, or multi-table transactionsAggregationsPipeline handles all 21 generators (count, avg, group, filter) at 50K docs in <50msEquivalent SQL works too, but no advantage at this scaleIngestion from varied sourcesAccept semi-structured data, validate at app layer with ZodMust conform to rigid schema before insert
Why the LLM's SQL advice doesn't apply here
The LLM conversation optimized for high-volume analytical dashboards (millions of rows, star schemas, OLAP). Our reality:

One entity type — no joins, no fact/dimension tables
Tens of thousands of rows — entire dataset fits in memory; pre-aggregation tables are unnecessary overhead
Simple aggregations — count by stage, average scores, filter by status. Not complex analytical queries
Schema is still being defined — the #1 risk is schema change friction, which SQL maximizes and MongoDB minimizes

What the LLM got right (applies regardless of DB choice)

Separate ingestion from serving (don't query source systems live)
Cache aggressively (widget data doesn't need per-request freshness)
Load widgets asynchronously (already implemented via lazy loading + per-widget fetching)
Incremental updates over full rebuilds


Architecture Overview
7 Source Systems (APIs, WebSockets, Excel, Email)
    │
    ▼
┌─────────────────────────────────────┐
│  INGESTION LAYER                    │
│  apps/server/src/ingestion/         │
│                                     │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ Adapters │  │ Normalizer       │ │
│  │ (per     │→ │ (source schema → │ │
│  │  source) │  │  AIUseCaseItem)  │ │
│  └──────────┘  └────────┬─────────┘ │
│                         │           │
│  ┌──────────────────────┘         │ │
│  │ Conflict Resolver + Validator  │ │
│  └──────────┬─────────────────────┘ │
└─────────────┼───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  MONGODB                            │
│                                     │
│  useCases        (primary data)     │
│  ingestionLogs   (audit trail)      │
│  sourceConfigs   (adapter configs)  │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  SERVING LAYER                      │
│                                     │
│  Widget Cache (in-process LRU)      │
│       │                             │
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
│  Same hooks, same widget components │
└─────────────────────────────────────┘

1. MongoDB Data Model
Collections
CollectionPurposeuseCasesOne document per AI use case. All 30+ fields flat at top level, plus _meta for source trackingingestionLogsAudit trail per ingestion run (source, records processed, errors). TTL: 90 dayssourceConfigsConfiguration per source adapter (type, schedule, field mappings, endpoint)
Document Schema (useCases)
{
  _id: ObjectId,
  useCaseId: "UC-12342",           // unique business key
  businessCaseId: "BCID-12342",

  // ... all existing AIUseCaseItem fields (flat, unchanged) ...

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

Flat top-level fields — generators access item.lifecycleStage directly, works identically with MongoDB documents
_meta.sources tracks field ownership — each source only $sets its owned fields, preventing cross-source overwrites
_meta.version — optimistic concurrency prevents lost updates from concurrent adapters
lastHash — skip writes when data hasn't changed (critical for Excel/email sources that re-ingest full datasets)

Index Strategy
IndexFieldsUsed ByUnique key{ useCaseId: 1 } uniqueAll ingestion upsertsLifecycle stage{ lifecycleStage: 1 }6 generators + table filterActive items{ isActive: 1 }5 generatorsAgent items{ agentName: 1 } partial (non-null)5 generatorsTable filters{ lob: 1, slaStatus: 1, status: 1, severity: 1 } compoundInventory tableText search{ useCaseName: "text", useCaseId: "text", businessCaseId: "text" }Table search
At 50K docs, all indexes fit in RAM (<50MB). Entire working set <500MB.
Source-to-Field Ownership
SourceTypeFields OwnedIdentity RegistryREST pollbusinessCaseId, useCaseId, useCaseName, lob, aiTechnologyGovernance APIREST pollstatus, severity, aiOnboardingStage, slaStatus, approvalDaysLifecycle TrackerREST polllifecycleStage, daysInCurrentStage, expectedSlaDaysModel MonitorWebSocketdriftScore, driftCategory, accuracy, latency, hallucinationRateRisk PlatformREST pollcriticalAlerts, policyViolations, guardrailTriggers, responsibleAIScoreFinance SystemExcel filemonthlyCostAlert SystemEmail/RESTalertType, alertStatus, owner, detectedTime
No two sources own the same field — conflicts are prevented by design.

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

Error Handling

Transient failures: Retry 3x with exponential backoff, then log and move to next cycle
Parse errors: Log failed record, skip, continue batch
Adapter crashes: Registry restarts after 60s cooldown, disables after 5 consecutive crashes


3. Serving Layer
Generator Migration
Generators become async functions that use MongoDB aggregation pipelines instead of in-memory array operations. Return types stay identical — no frontend changes needed.
Current PatternMongoDB Equivalentinventory.filter(i => i.lifecycleStage === 'POC').length$match + $countinventory.reduce((sum, i) => sum + i.approvalDays, 0) / inventory.length$group + $avginventory.filter(i => i.alertType !== null)$match: { alertType: { $ne: null } }Group by field, count per group$group: { _id: '$field', count: { $sum: 1 } }
Caching Strategy
Phase 1: In-process LRU cache (no external dependency)
TierTTLWidgetsHot (10-30s)Frequently accessed, changes with ingestionlifecycle-kpi, risk-stats, live-risk-events, production-growth, monthly-costWarm (60-120s)Analytical/trend, slight staleness OKAll other 16 widgets
Cache invalidation is triggered by the ingestion writer based on which fields were updated → which widgets are affected.
Phase 2: Redis (if scaling to multiple server instances behind load balancer)
Socket.io Push
Replace current setInterval-based emission with ingestion-driven push: when data changes invalidate a widget cache, the recomputed data is pushed to subscribed Socket.io rooms. Any widget can opt into real-time updates via dashboard config dataSource.type: 'socket'.

4. API Changes
Widget endpoints — minimal change
Routes stay at GET /api/widgets/:type/data. Only internal change: handlers become async, generators read from DB through cache layer.
Inventory endpoint — server-side pagination
At 50K records, /api/inventory can no longer return everything. New query params:
GET /api/inventory?page=1&pageSize=10&lifecycleStage=POC&search=fraud&sortBy=useCaseName&sortOrder=asc
Response adds pagination metadata:
json{
  "data": [...],
  "meta": {
    "timestamp": "...",
    "pagination": { "page": 1, "pageSize": 10, "totalItems": 487, "totalPages": 49 }
  }
}
Client impact: UseCasesTable.tsx switches from client-side to server-side filtering/pagination. URL param state model stays the same (already uses useSearchParams), but changes trigger API calls instead of local filtering.
New admin endpoints

GET /api/admin/ingestion/status — adapter health dashboard
GET /api/admin/ingestion/logs — paginated audit logs
POST /api/admin/ingestion/:sourceId/trigger — manual ingestion trigger


5. Seed Data Strategy

Seed script (apps/server/src/scripts/seed.ts): Takes existing 110-item mock array, adds _meta, inserts into MongoDB
Source onboarding: Connect one source at a time, starting with Identity Registry (creates core docs), then layer on field-owning sources
Dry-run mode: Each adapter supports processing without writing, outputting to ingestionLogs for validation
Validation: Zod schemas derived from @command-center/types validate every record before write


6. Performance Summary
ConcernStrategyWidget load speedIn-process LRU cache (0ms hit) → MongoDB aggregation (5-50ms miss)Table paginationServer-side with compound indexes on filter fieldsIngestion throughputBatched bulkWrite, hash-based skip for unchanged recordsConnection overheadMongoDB driver pool (5-20 connections), single MongoClient instanceReal-time updatesSocket.io push on data change, not on timer intervalSchema changesMongoDB: just add/remove fields. Zod validation updated alongside TypeScript types

New Dependencies
PackagePurposemongodbMongoDB Node.js driverzodRuntime schema validation for ingested datanode-cronScheduling for polling adapterschokidarFilesystem watching for Excel adapterxlsx or exceljsExcel file parsinglru-cacheIn-process widget cache

Files Modified/Created
AreaFilesChangeNewapps/server/src/ingestion/* (8 files)Entire adapter frameworkNewapps/server/src/db/connection.tsMongoDB client initNewapps/server/src/scripts/seed.tsMock → MongoDB migrationModifiedapps/server/src/mocks/generators.ts → apps/server/src/data/generators.tsIn-memory → async MongoDB pipelinesModifiedapps/server/src/routes/widgets.tsCache layer, async handlersModifiedapps/server/src/routes/inventory.tsServer-side pagination/filteringModifiedapps/server/src/sockets/widget-events.tsIngestion-driven pushModifiedapps/server/src/index.tsInit MongoDB + ingestion on startupModifiedpackages/types/src/api.tsAdd pagination to ApiResponseModifiedapps/client/src/components/use-cases/UseCasesTable.tsxServer-side pagination/filtering

Verification

Seed: Run seed script, verify db.useCases.countDocuments() = 110
Generators: Run each of 21 generators against DB, compare output to current in-memory generators (should produce identical data)
Widget endpoints: Hit all /api/widgets/:type/data endpoints, verify same response shapes
Table: Test /api/inventory with various filter/search/pagination params
Ingestion: Configure one test adapter (REST poller against a mock endpoint), verify documents update in MongoDB and widget caches invalidate
Frontend: Dashboard loads identically, table works with server-side pagination