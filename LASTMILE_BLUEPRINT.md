# Last-Mile AI Appliance Ecosystem
## Product + Architecture + Website Blueprint

**Version:** 2.0 — Hedera AI Studio Integration
**Date:** February 24, 2026
**Author:** Swarm & Bee

---

# PART 1 — Defining the Category

## What Last-Mile AI Appliances Are

A Last-Mile AI Appliance is a physical computing device that runs AI agents on-premises inside a business. It sits in the warehouse, the dispatch center, the factory floor, the cold storage facility. It runs 24/7. It processes local data. It takes local actions. It never sends sensitive data to the cloud.

The mental model:

| Category | Device | Function |
|----------|--------|----------|
| Networking | Router | Moves packets |
| Storage | NAS | Stores files |
| Security | Firewall | Blocks threats |
| Payments | POS Terminal | Processes transactions |
| **AI Operations** | **AI Appliance** | **Runs autonomous agents** |

The AI Appliance is a new device category. It is not a repurposed server, not a mini-PC with an LLM, not a Raspberry Pi running Ollama. It is a purpose-built, industrially-rated, fleet-managed computing appliance designed to run domain-specific AI agents at the point of operations.

## Why Cloud-Only Agents Fail

The agent economy is built on cloud infrastructure. Every major AI agent framework assumes: reliable internet, acceptable latency, tolerance for data leaving the premises, and per-token pricing that scales linearly.

These assumptions break in the real world:

**1. Latency** — A cold storage anomaly requires sub-second detection. A 200ms cloud round-trip plus queue time plus inference time means the compressor has failed before the alert fires. Local inference: 50-80ms.

**2. Connectivity** — Warehouses are Faraday cages. Factories run heavy motors that create RF interference. Rural logistics hubs use satellite internet. When the connection drops, cloud agents are dead. A local appliance runs through the outage.

**3. Sovereignty** — FDA 21 CFR Part 11 regulates cold chain data. HIPAA governs clinical environments. ITAR restricts defense manufacturing data. FSMA covers food safety. These frameworks do not permit operational data to transit public cloud inference endpoints.

**4. Cost** — A single temperature sensor generates 86,400 readings per day (one per second). Ten sensors per zone, five zones per facility = 4.3 million readings per day. At $0.01 per cloud inference, that is $43,000/day. Local inference on a $249 device: $0.25/day in electricity.

**5. Integration** — Real business systems (PLCs, Modbus sensors, RS-485 serial devices, SCADA, local databases) require physical network access. A cloud agent cannot read a Modbus register over the internet. A local appliance on the same LAN can.

## The Missing Layer

Cloud AI provides intelligence. It reasons. It plans. It generates.

But intelligence without execution is a whitepaper.

The agent economy is missing its physical body — the device that takes the intelligence and applies it to the real world, at the point of operations, against real sensors, real machines, real documents, real emergencies.

Last-Mile AI Appliances are that body.

```
CLOUD (Intelligence)          EDGE (Execution)
─────────────────────         ─────────────────
Large language models         Small specialized models
General knowledge             Domain expertise
Per-token pricing             Zero marginal cost
API-dependent                 Always-on
Data leaves premises          Data stays local
100-2000ms latency            50-80ms latency
```

## The "AI Appliance = Router for Agents" Model

In 1999, every business needed a router. Nobody debated this. You needed internet access, you bought a router. It was a purpose-built device that did one thing well. It sat in a closet. It ran 24/7. You forgot about it until something broke.

In 2026, every business that runs physical operations will need an AI appliance. Temperature monitoring, fleet tracking, machine maintenance, supply chain management — these are not optional tasks that a business might adopt if an API is convenient enough. These are operational necessities that currently consume hundreds of hours of manual labor per month.

The AI Appliance replaces the clipboard, the spreadsheet, the manual log, the "let me go check on that" — with a device that checks everything, all the time, and only bothers a human when something actually requires human judgment.

---

# PART 2 — Website Page: swarmandbee.com/lastmile

## Hero Section

**Badge:** LAST-MILE AI APPLIANCES

**Headline:**
Cloud AI thinks.
Edge AI does.

**Subtext:**
Physical, always-on AI devices that run domain-specific agents inside your business. Your data never leaves your building.

**CTA:** Request an Appliance →

---

## Problem Section

**Label:** THE GAP
**Title:** The agent economy has no body.

AI agents can reason, plan, and generate. But they can't read your temperature sensors. They can't parse your Modbus registers. They can't run during an internet outage. They can't keep your FDA data off someone else's server.

Cloud AI is intelligence. Your business needs execution.

**Four problem cards:**

**Latency Kills**
Cloud round-trips take 200-2000ms. Your compressor fails in 30 seconds. By the time the cloud responds, the damage is done. Local inference runs in 50ms.

**Connectivity Is Unreliable**
Warehouses are metal boxes. Factories have RF interference. Rural hubs have satellite internet. When the connection drops, your cloud agent is dead. The appliance keeps running.

**Your Data Cannot Leave**
FDA cold chain data. HIPAA records. Proprietary production data. ITAR defense manufacturing. Regulatory frameworks don't care how good your cloud API is — the data cannot transit a public endpoint.

**Cloud Pricing Doesn't Scale**
86,400 sensor readings per day per device. At cloud inference pricing, continuous monitoring costs more than the product you're protecting. Local inference: $0.25/day in electricity.

---

## Product Section

**Label:** THE APPLIANCE
**Title:** An AI agent that lives where you work.

The BeeMini is a purpose-built edge AI device. It runs a fine-tuned small language model locally, processes your sensor data, monitors your operations, generates reports, detects anomalies, and takes action — all without an internet connection.

When it encounters something beyond its capability, it escalates to Swarm HQ where larger models handle the complex reasoning. Then it goes back to work.

**Spec Grid:**
- Compute: NVIDIA Jetson Orin Nano Super
- Memory: 8GB LPDDR5
- Power: 10W (wall outlet or PoE)
- Inference: 30+ tokens/second
- Model: 4B fine-tuned specialist
- Form: Fanless, DIN-rail mount
- Environment: -20C to 50C
- Boot: 45 seconds to operational

**Five properties:**
- Always-on — Runs 24/7. No daily charge. No token meter.
- Offline-first — Full operation without internet. Queues escalations for when connectivity returns.
- Sovereign — Data never leaves the device. Encrypted at rest. No cloud telemetry.
- Updatable — New LoRA adapters pushed over-the-air in minutes. Model improves monthly.
- Connected — Escalates to Swarm HQ (14B-70B models) when local model needs help. 5% of queries.

---

## Three Tiers

**BeeMini — $249**
Jetson Orin Nano Super. 8GB. 10W. Fanless.
Runs 4B specialist models at 30+ tok/s. Single-agent deployment. Perfect for cold storage monitoring, sensor analysis, document processing.
Best for: Single-facility, single-vertical deployment.

**BeePro — $599**
Jetson Orin NX. 16GB. 40W.
Runs 8B models. Multi-agent capable — run Cold Storage + Supply Chain on one device. CAN bus for fleet/vehicle integration.
Best for: Multi-agent facilities, logistics hubs, factories.

**BeeRack — $3,500/mo**
RTX PRO 6000 Blackwell. 96GB GDDR7.
Runs 14B-32B models. Full rack-scale inference. Multi-model serving. Handles the most complex operations — full industrial plants, enterprise logistics, multi-site orchestration.
Best for: Enterprise deployment, heavy inference, multi-site HQ node.

---

## Vertical Agents Section

**Label:** FIVE AGENTS
**Title:** Specialized AI for real operations.

Each agent is fine-tuned on domain-specific data using Swarm & Bee's CoVe-verified training pipeline. 30/30 SFT benchmark. Every pair verified by a 235B-parameter model.

### Cold Storage Agent

Continuous monitoring for temperature-controlled environments. Warehouses, pharma storage, food distribution, refrigeration systems.

- Monitor temperature and humidity 24/7 across all zones
- Detect anomalies in real-time (rate-of-change, correlation, pattern matching)
- Generate FDA 21 CFR Part 11 and HACCP compliance reports daily
- Predict equipment failures (compressor efficiency degradation, refrigerant leaks)
- Automate alerts and maintenance tickets

*Detects a refrigerant leak 30 minutes before product loss. Automatically alerts maintenance, creates a work order, and documents the excursion for compliance.*

### Logistics Agent

Real-time fleet intelligence for routing, delivery, and dispatch operations.

- Optimize routes with live traffic, weather, and delivery windows
- Predict ETAs with actual GPS telemetry, not static estimates
- Detect incidents (breakdowns, harsh braking, unauthorized stops)
- Manage driver hours-of-service compliance
- Generate daily fleet performance reports

*Vehicle breaks down at 10:42 AM. Agent identifies the problem, locates the nearest rescue vehicle, re-routes remaining deliveries, notifies customers with updated ETAs, and creates a maintenance work order — all in 90 seconds.*

### Industrial Agent

Predictive maintenance and operational intelligence for manufacturing.

- Monitor machine health (vibration, temperature, current, pressure)
- Predict failures before they cause unplanned downtime
- Assist operators with SOPs (retrieval from embedded manuals)
- Generate shift handover reports automatically
- Calculate OEE (Overall Equipment Effectiveness) in real-time

*Detects a bearing defect 18 days before failure. Schedules replacement during planned maintenance. Zero unplanned downtime. Estimated savings: $11,820 per incident.*

### Supply Chain Agent

Procurement intelligence, inventory optimization, and vendor management.

- Forecast demand using 24-month historical patterns
- Optimize inventory levels and safety stock per SKU
- Extract structured data from POs, invoices, and BOLs
- Three-way match: PO vs. receipt vs. invoice (catches discrepancies)
- Track vendor performance (on-time delivery, quality, pricing consistency)

*Catches a $28,450 fraudulent invoice by detecting mismatched bank routing numbers, email domain anomalies, and invoice format deviations — before payment is processed.*

### Orchestrator

The brain of the appliance. Manages all vertical agents running on the device.

- Allocates GPU, memory, and storage across agents
- Schedules tasks by priority (safety alerts override analytics)
- Manages inter-agent communication (supply chain asks cold storage for temp data)
- Handles security, logging, and audit trails
- Escalates to cloud models when local confidence is low
- Manages OTA updates and plugin installation

*When the industrial agent detects a machine down, the orchestrator automatically notifies the supply chain agent to adjust the production schedule, delays an outbound shipment, and updates the customer portal — without human intervention.*

---

## Hub & Spoke Section

**Label:** ARCHITECTURE
**Title:** Local execution. Global intelligence.

**The Model:**
95% of operations are handled locally by the edge appliance. The small model knows its domain. It's seen 50,000+ verified examples of exactly this type of work.

5% of queries — novel situations, complex multi-step reasoning, cross-site correlation — escalate to Swarm HQ where 14B-70B models handle the hard questions.

**The Flow:**
```
SENSOR → LOCAL AGENT → DECISION
  │                       │
  │   95% → LOCAL ACTION  │
  │   (alert, report,     │
  │    ticket, document)   │
  │                       │
  │   5% → ESCALATE TO HQ │
  │   (complex reasoning,  │
  │    novel situation)    │
  │                       │
  └───── DATA STAYS LOCAL ─┘
```

**Privacy Boundary:**
Raw data never leaves the device. Not sensor readings. Not documents. Not customer data. Not production logs.

What crosses the boundary: structured queries (anonymized), device health metrics, model performance telemetry. That's it.

**Cost Optimization:**
Local inference cost: $0 per query (electricity only, ~$5/month)
Cloud escalation cost: ~$0.003 per query
Monthly escalation budget: 500 queries included (~$1.50)
Net cost: $5/month for continuous AI operations

Every escalation is logged. Patterns in escalations become training data for the next LoRA update. The local model gets smarter every month. Escalation rate drops: 5% → 3% → 1.5% → <1%.

---

## Hedera Integration Section

**Label:** TRUST LAYER
**Title:** Agents act locally. Verified globally.

Powered by Hedera AI Studio.

AI agents making autonomous decisions in regulated industries need more than accuracy. They need verifiability. An FDA auditor needs to prove which agent made which decision, based on which model version, at which timestamp.

Hedera provides the cryptographic trust layer.

### Agent Identity

Every AI appliance agent is registered on Hedera with a decentralized identity.

- **Agent DID** — unique decentralized identifier anchored to Hedera Consensus Service
- **Model version** — which base model + which LoRA adapter, with IPFS content hash
- **Permissions** — what tools the agent is authorized to use, on-chain
- **Deployment history** — when deployed, when updated, by whom
- **Owner** — which enterprise, which site, which appliance

When a regulator asks "which AI made this decision?" — the answer is on-chain, timestamped, immutable.

### Execution Receipts

Every critical action produces a cryptographic receipt.

```
RECEIPT {
  agent_id: "did:hedera:mainnet:0.0.10291827/cold-storage-v2.3"
  action: "temperature_excursion_detected"
  timestamp: "2026-02-24T02:18:42Z"
  inputs_hash: "sha256:a1b2c3..."  // hash of sensor data (data stays local)
  output_hash: "sha256:d4e5f6..."  // hash of generated alert
  model_version: "swarm-cold-4b-lora-v2.3"
  confidence: 0.92
  escalated: false
  hcs_topic: "0.0.10291838"
  hcs_sequence: 847291
}
```

The receipt proves: this agent, running this model, saw this data (by hash, not content), made this decision, at this time. Anchored to Hedera Consensus Service. Microsecond finality. $0.0001 per message.

### Agent Registry

All deployed agents are registered in an on-chain registry (HCS topic + HTS token).

**Registry Schema:**

| Field | Description | Example |
|-------|-------------|---------|
| agent_type | Vertical classification | "cold-storage" |
| agent_version | Semantic version | "2.3.1" |
| model_id | Base model reference | "swarm-cold-4b" |
| lora_version | Adapter version | "v2.3" |
| lora_cid | IPFS hash of adapter weights | "ipfs://bafy..." |
| site_id | Deployment location | "site-chi-warehouse-7" |
| appliance_id | Hardware serial | "SB-MINI-04821" |
| deployed_at | Activation timestamp | "2026-02-24T00:00:00Z" |
| capabilities | Authorized tools | ["sensor.read", "alert.send", "report.generate"] |
| status | Operational state | "active" |

Enterprise fleet managers can query the registry to see every agent deployed across every site — what version it's running, what it's authorized to do, and a complete audit trail of every update.

### Why Hedera

| Requirement | Hedera Capability |
|-------------|------------------|
| Immutable audit log | HCS (Hedera Consensus Service) — ordered, timestamped, immutable message log |
| Agent identity | HCS topic per agent type + HTS NFT per deployed instance |
| Model provenance | IPFS content hash stored on HCS, verifiable by anyone |
| Cost at scale | $0.0001 per HCS message. 10,000 receipts/day = $1/day |
| Enterprise grade | Used by Google, IBM, Boeing, DTML. Governing council. Not a "degen chain." |
| Speed | 3-5 second finality. Microsecond consensus ordering |

**The bottom line:** Your compliance auditor can verify every action your AI agent took. On-chain. Timestamped. Immutable. That's the difference between "we think our AI is working correctly" and "we can prove it."

---

## Enterprise Deployment Section

**Label:** DEPLOYMENT
**Title:** Order to operational in 72 hours.

**Step 1: Configure (Day 1)**
Select your vertical agents. Tell us your sensor types, your CMMS, your ERP. We pre-load the model, the knowledge base, the integration drivers, and the agent manifest. Device burns in for 8 hours.

**Step 2: Ship & Plug In (Day 2-3)**
Device arrives pre-configured. Plug in Ethernet and power. It boots in 45 seconds. Connects to Swarm HQ via encrypted tunnel. Fleet dashboard goes live.

**Step 3: Operational (Day 3+)**
Agents start monitoring immediately. Guided setup wizard configures sensors (auto-discovery on your network). Set alert recipients. Enter integration credentials. Run system check. Status: operational.

**Ongoing:**
- OTA model updates (weekly-monthly, zero downtime)
- Fleet dashboard monitoring at HQ
- 72-hour hardware replacement SLA
- Monthly business reviews with ROI analysis

---

## Pricing Section

**Label:** PRICING
**Title:** Cheaper than one cloud GPU hour per day.

| Package | Hardware | Software | Total |
|---------|----------|----------|-------|
| BeeMini | $249 one-time | $49/mo | $249 + $49/mo |
| BeePro | $599 one-time | $79/mo | $599 + $79/mo |
| BeeRack | — | $3,500/mo | $3,500/mo all-in |

Software includes: 1 vertical agent, SwarmOS, fleet management, OTA updates, 500 escalation credits/month.

Additional agents: $29/mo each.
Priority support: $99/mo per device.
Custom LoRA training: project-based.

**Comparison:**
- AWS H100 (1 GPU, on-demand): ~$32/hour = $23,000/month
- BeeMini (always-on, local inference): $49/month
- That's a 469:1 cost ratio for continuous operations.

---

## Final CTA

**Title:** Put an AI agent inside your business.
**Subtext:** Not in the cloud. Not behind an API. On your floor. In your warehouse. Next to your machines.
**CTA:** Request an Appliance → /rfp

---

# PART 3 — Appliance Hardware & Base Stack

## Hardware: The BeeMini

The BeeMini is the flagship edge appliance. Designed for 24/7 unattended operation in commercial and industrial environments.

### Specification

| Component | Specification |
|-----------|--------------|
| **Compute** | NVIDIA Jetson Orin Nano Super |
| **CPU** | 6-core Arm Cortex-A78AE |
| **GPU** | 1024-core Ampere, 67 TOPS INT8 |
| **RAM** | 8GB LPDDR5 |
| **Storage** | 256GB NVMe M.2 (encrypted) |
| **Power** | 10-25W (DC barrel jack, PoE optional) |
| **Network** | GbE Ethernet, WiFi 6, BLE 5.0 |
| **I/O** | 2x USB 3.2, RS-485, Modbus TCP, GPIO header |
| **Enclosure** | Fanless anodized aluminum |
| **Mount** | DIN-rail or VESA |
| **Dimensions** | 130 x 100 x 40mm |
| **Operating Temp** | -20C to 50C |
| **Certification** | FCC, CE, UL (target) |
| **Model Capacity** | 3B-4B INT4 (GGUF via TensorRT) |
| **Inference** | 30-40 tokens/second |

### Three Tiers

| Tier | Device | Compute | VRAM | Power | Models | Price |
|------|--------|---------|------|-------|--------|-------|
| BeeMini | Jetson Orin Nano Super | 67 TOPS | 8GB | 10W | 4B INT4 | $249 |
| BeePro | Jetson Orin NX 16GB | 100 TOPS | 16GB | 40W | 8B INT4 | $599 |
| BeeRack | RTX PRO 6000 Blackwell | — | 96GB | 150W | 14B-32B | $3,500/mo |

## SwarmOS: The Appliance OS

SwarmOS Edge is a minimal, hardened Linux distribution purpose-built for AI appliance operation. It is not a general-purpose OS. It runs agents, not applications.

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      SwarmOS Edge                            │
├──────────────────────────────────────────────────────────────┤
│  ┌───────────┐ ┌──────────┐ ┌─────────────┐ ┌────────────┐ │
│  │ Vertical  │ │ Skill    │ │ Orchestr-   │ │ Fleet      │ │
│  │ Agents    │ │ Plugins  │ │ ator        │ │ Agent      │ │
│  └─────┬─────┘ └────┬─────┘ └──────┬──────┘ └──────┬─────┘ │
│  ┌─────▼────────────▼──────────────▼────────────────▼─────┐ │
│  │                   AGENT RUNTIME                        │ │
│  │  LLM Engine │ Vector DB │ Tool Exec │ Hedera SDK       │ │
│  └───────────────────────┬────────────────────────────────┘ │
│  ┌───────────────────────▼────────────────────────────────┐ │
│  │                   SYSTEM LAYER                         │ │
│  │  Sensor HAL │ Network │ Vault │ Security │ Update Mgr  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Hardened Linux (Ubuntu Core 24 / Yocto)      │ │
│  └────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│                 HARDWARE (Jetson / RTX PRO 6000)             │
└──────────────────────────────────────────────────────────────┘
```

### Boot Flow

```
1. POWER ON
   └─> UEFI Secure Boot (signed kernel, Jetson fuse-locked)

2. KERNEL
   └─> Read-only rootfs mounts
   └─> dm-crypt unlocks data partition (TPM-sealed AES-256 key)

3. SYSTEM INIT
   └─> Ethernet initializes (WiFi fallback)
   └─> WireGuard VPN to Swarm HQ (or offline mode if no connectivity)
   └─> Sensor HAL probes all connected devices (auto-discovery)
   └─> Fleet agent sends heartbeat: "SB-MINI-04821 ONLINE"

4. AGENT RUNTIME
   └─> LLM engine loads model from NVMe (GGUF + TensorRT)
   └─> Vector DB loads domain embeddings (LanceDB)
   └─> Orchestrator reads agent manifest
   └─> Vertical agents start (Cold Storage, Logistics, etc.)
   └─> Hedera SDK initializes (agent DID, receipt signing)

5. OPERATIONAL (< 45 seconds from power-on)
   └─> Sensor streams begin processing
   └─> Scheduled tasks execute
   └─> Escalation gateway ready
   └─> Fleet management accepting commands
```

### Security Model

| Layer | Mechanism |
|-------|-----------|
| Boot | UEFI Secure Boot, Jetson fuse-locked, signed kernel |
| Disk | dm-crypt AES-256-XTS, TPM 2.0 sealed key |
| Network | WireGuard VPN (always-on), mTLS on all API calls, no open inbound ports |
| Runtime | cgroup isolation per agent, no root execution, seccomp filters |
| Data | SQLCipher for structured data, AES-256 for files |
| Updates | Signed packages (ed25519), A/B partition atomic swap, auto-rollback |
| Access | No SSH by default. Remote access via fleet management only (audited) |
| Identity | TPM-backed device certificate + Hedera DID for agent identity |
| Audit | Tamper-evident log, Hedera-anchored execution receipts |

### Fleet Management

Each appliance maintains a persistent WireGuard tunnel to Swarm HQ.

**Capabilities:**
- Real-time device health (CPU, GPU, temp, disk, memory, network)
- Remote shell (authorized operators only, all sessions logged)
- OTA model updates (LoRA hot-swap, zero downtime)
- Configuration management (thresholds, schedules, integrations)
- Structured telemetry (batched every 5 minutes)
- Batch operations (update all cold storage agents across 500 sites)

**Communication:**
- Heartbeat: 60-second interval (UDP, 128 bytes)
- Command channel: gRPC over mTLS (bidirectional)
- Update channel: HTTPS pull from signed artifact server
- Hedera: HCS message submission for receipts

---

# PART 4 — Agent OS Architecture (SwarmOS Edge)

## Module Specifications

### 1. Local LLM Runtime

**Engine:** llama.cpp compiled with TensorRT backend (Jetson) or vLLM (BeeRack).

**Model Management:**
- Models stored as GGUF (BeeMini/BeePro) or AWQ (BeeRack) on encrypted NVMe
- Base model + LoRA adapter loaded independently
- Hot-swap: new LoRA adapters load without restarting the base model
- Health check: 10 test prompts after every model update (auto-rollback on failure)

**Performance:**

| Tier | Model | Throughput | First Token | Context |
|------|-------|-----------|-------------|---------|
| BeeMini | 4B INT4 | 30-40 tok/s | 80ms | 4096 |
| BeePro | 8B INT4 | 18-25 tok/s | 120ms | 8192 |
| BeeRack | 14B INT4 | 25-35 tok/s | 60ms | 16384 |

### 2. Vector Database

**Engine:** LanceDB (embedded, Rust-based, no server process, zero-copy)

**Purpose:** RAG over local domain knowledge — SOPs, equipment manuals, regulatory standards, historical patterns.

**Capacity:**
- BeeMini: 500K vectors (384-dim, ~800MB)
- BeePro: 2M vectors (~3GB)
- BeeRack: 10M+ vectors

**Embedding:** Local embedding model (150M params, runs on same GPU) generates embeddings for new documents. HQ can also push pre-computed embedding packs.

### 3. Tool Execution Layer

Agents execute tools — not just generate text.

**Tool Registry:**
```
sensor.read(sensor_id, metric)       → float
sensor.read_all()                    → SensorSnapshot
alert.send(severity, message, to)    → bool
report.generate(template, data)      → PDF path
ticket.create(system, title, body)   → ticket_id
database.query(sql)                  → rows
file.read(path)                      → content
escalate(query, context)             → response
hedera.submit_receipt(receipt)       → hcs_sequence_number
integration.call(system, method)     → result
```

**Sandboxing:** Each tool runs in a cgroup-isolated process. Restricted filesystem access. Network calls limited to whitelisted endpoints. All invocations logged with I/O hashes.

**Permission Manifest (per agent):**
```yaml
agent: cold-storage
version: 2.3
permissions:
  allow:
    - sensor.read_*
    - alert.send
    - report.generate
    - ticket.create
    - hedera.submit_receipt
    - escalate (rate_limit: 50/hour)
  deny:
    - database.write
    - file.write
    - integration.* (except: integration.call("cmms"))
```

### 4. Sensor & Enterprise Integrations

**Protocol Support:**

| Protocol | Use Case | Notes |
|----------|----------|-------|
| Modbus TCP/RTU | Industrial sensors, PLCs, power meters | Most common industrial |
| MQTT | IoT sensors, building automation | Pub/sub, lightweight |
| OPC-UA | SCADA, industrial automation | Enterprise standard |
| BACnet | HVAC, building management | Commercial buildings |
| RS-485/Serial | Legacy sensors, barcode scanners | Adapter cable in box |
| GPIO | Digital I/O, door sensors, relays | Direct connection |
| CAN bus | Vehicle/fleet telemetry (BeePro+) | Logistics applications |
| HTTP/REST | Modern APIs, cloud services, CMMS | Standard integration |
| SNMP | Network equipment | Infrastructure monitoring |

**Sensor Abstraction:**
Every sensor reading flows through the same pipeline regardless of protocol:
```
PHYSICAL SENSOR → PROTOCOL DRIVER → HAL → NORMALIZE → BUFFER → AGENT
```

Configuration is declarative:
```yaml
sensors:
  - id: zone-b-temp-1
    protocol: modbus_tcp
    address: 192.168.1.50:502
    register: 100
    type: temperature
    unit: celsius
    poll_interval: 30
    thresholds:
      warning: -15.0
      critical: -12.0
```

### 5. Secure Data Vault

All operational data is encrypted at rest and never leaves the device except through authorized channels.

**Components:**
- SQLCipher database for structured data (sensor logs, events, reports)
- AES-256 encrypted filesystem for documents and model artifacts
- Configurable retention policies (30-day default for sensor data, 3-year for compliance reports)
- Export controller: data exits only through fleet management or authorized API calls

### 6. Plugin / Skill System

**Plugins** add new integrations, tools, or capabilities without replacing the agent.

**Skills** add domain knowledge or specialization via LoRA micro-adapters + tool definitions.

```
PLUGIN PACKAGE:
├── manifest.yaml        # Name, version, permissions, dependencies
├── tools/               # New tool definitions
├── drivers/             # Integration drivers (Modbus device profiles, etc.)
├── embeddings/          # Pre-computed vector embeddings
├── lora/                # Optional LoRA micro-adapter
└── tests/               # Validation prompts
```

**Installation:** Plugins are signed packages pushed via fleet management. The device verifies the signature, checks dependencies, loads the plugin in a sandboxed container, and runs validation tests. If tests fail, the plugin is rejected.

### 7. Cloud Escalation Gateway

**When to escalate:**
- Model confidence < 0.6 on a query
- Novel situation not seen in training data
- Cross-site correlation needed
- Explicit operator request

**What gets sent upstream:**
```json
{
  "agent": "cold-storage",
  "site": "chi-warehouse-7",
  "query": "Compressor C3 showing unusual power oscillation pattern...",
  "context_summary": "Zone B, -17.8C, compressor running, power oscillating 2.1-2.8kW...",
  "confidence": 0.54,
  "local_hypothesis": "Possible contactor relay degradation",
  "priority": "P2"
}
```
Note: structured context only. No raw sensor dumps. No customer data. No documents.

**Response flow:** HQ model (14B-70B) processes the query, returns a structured response, local agent executes the recommended action using local tools.

### 8. Offline-First Behavior

The appliance is designed to operate indefinitely without internet.

**When offline:**
- All local inference continues normally
- Sensor monitoring continues at full frequency
- Alerts queue locally (and send when connectivity returns)
- Reports generate and store locally
- Escalation requests queue (max 1,000, priority-ordered)
- Hedera receipts queue (submit when connectivity returns)
- Fleet heartbeats pause (HQ marks device as "connectivity interrupted")

**When connectivity returns:**
- Queued escalations drain in priority order
- Queued Hedera receipts submit in batch
- Fleet agent resumes heartbeat
- Any pending OTA updates download
- No data is lost. No operations are missed.

---

# PART 5 — Vertical Agents

## 1. Cold Storage Agent

### Mission
Autonomous monitoring, compliance, and predictive maintenance for temperature-controlled environments.

### Inputs

| Source | Protocol | Frequency |
|--------|----------|-----------|
| Temperature sensors (per zone) | Modbus RTU/TCP | Every 30s |
| Humidity sensors | Modbus/MQTT | Every 60s |
| Door sensors (open/close) | GPIO/MQTT | Event-driven |
| Compressor status (on/off/fault/defrost) | Modbus | Every 60s |
| Power meters (per compressor) | Modbus | Every 60s |
| Evaporator coil temperature | Modbus | Every 30s |
| CMMS work order history | REST API | Poll every 15min |
| Operator queries | Local web UI | On-demand |

### Outputs

| Output | Destination |
|--------|-------------|
| Real-time anomaly alerts | SMS, email, Slack, CMMS |
| Daily FDA/HACCP compliance report (PDF) | Vault + email + regulatory archive |
| Weekly trend analysis | Web dashboard |
| Predictive maintenance recommendations | CMMS work orders |
| Temperature excursion documentation | Compliance archive (3-year retention) |
| Hedera execution receipts | HCS topic (for every alert and report) |

### Daily Workflows

**06:00 — Morning Health Check**
Read all sensor values from past 8 hours. Compare against zone setpoints. Check for excursions (value outside range > 15 min). Cross-reference with door events and compressor logs. Classify any excursions: planned_defrost, door_event, equipment_fault, unexplained. Generate summary. Alert on equipment faults.

**Continuous — Anomaly Loop (every 30 seconds)**
Read latest sensor snapshot. Calculate anomaly score:
- Statistical deviation from 7-day rolling mean
- Rate-of-change analysis (temp rising despite compressor running = failure)
- Correlation analysis (power draw vs. temperature delta)
- Pattern matching against known failure signatures

Score > 0.7: generate alert, create CMMS ticket, calculate time-to-critical, submit Hedera receipt.
Score 0.4-0.7: increase monitoring frequency, add to watch list.
Score < 0.4: normal operation.

**17:00 — Compliance Report**
Generate daily FDA 21 CFR Part 11 report. Continuous temperature log (all zones), min/max/avg, excursion documentation, corrective actions, digital signature (device identity key). Store in vault. Email to compliance officer. Submit report hash to Hedera (provenance proof).

**Weekly — Predictive Maintenance**
Analyze 7-day trends: compressor runtime (increasing = efficiency loss), cycle frequency (short-cycling = problem), power draw trend (rising = motor wear), defrost effectiveness, coil delta-T. Generate maintenance recommendations with priority and estimated timeline. Push to CMMS.

### Deployment Scenario

**Facility:** 40,000 sq ft pharma cold storage. 6 temperature zones (-80C to +25C). 12 compressors. 48 sensors. FDA-regulated.

**Before BeeMini:** 3 technicians doing manual temp checks every 4 hours. Paper logs. Monthly audits take 2 days to compile. Two spoilage events per year ($50K+ each).

**After BeeMini:** One device monitoring all 48 sensors continuously. Auto-generated compliance reports. Anomaly detection caught a failing ULT freezer compressor 9 days before failure. Zero spoilage events. Audit preparation: 10 minutes (pull reports from vault). Technician time redirected to maintenance and optimization.

**ROI:** $249 device + $49/mo × 12 = $837/year. Prevented one spoilage event: $50,000. ROI: 59x.

---

## 2. Logistics Agent

### Mission
Real-time fleet intelligence, route optimization, and operational oversight for logistics operations.

### Inputs

| Source | Protocol | Frequency |
|--------|----------|-----------|
| Vehicle GPS telemetry | MQTT/API | Every 10-30s |
| Delivery management system | REST API | Event-driven |
| Driver mobile app (status, photos) | REST API | Event-driven |
| ELD (Hours of Service) | API | Every 15min |
| Vehicle telematics (engine codes) | CAN bus/API | Event-driven |
| Weather API | REST | Every 30min |
| Traffic API | REST | Every 5min |
| Fuel card transactions | API/SFTP | Near-real-time |

### Outputs

| Output | Destination |
|--------|-------------|
| Optimized route plans | Dispatch dashboard, driver app |
| Live ETA predictions | Customer portal, dispatch |
| Incident alerts (breakdown, safety event) | Dispatch, fleet management |
| Re-routing recommendations | Dispatch dashboard |
| Daily fleet performance report | Operations manager |
| Driver scorecards | Safety manager |
| HOS compliance summaries | DOT compliance |
| Hedera execution receipts | HCS topic |

### Daily Workflows

**05:00 — Pre-Route Planning**
Pull today's orders from TMS. Check vehicle/driver availability (maintenance schedules, HOS limits). Pull weather forecast. Run route optimization: cluster deliveries by geography, respect time windows, factor capacity/type, minimize distance, account for traffic. Generate route sheets. Flag at-risk deliveries. Push to drivers by 05:30.

**Continuous — Live Fleet Monitoring**
Every 30 seconds: ingest GPS from all vehicles. Compare position to planned route. Calculate live ETA (distance + current speed + traffic + HOS remaining). If ETA slips beyond window: alert dispatch with options (notify customer, re-route, reassign). If vehicle deviates: check if known pattern (fuel, lunch), alert if unexplained. Update customer portal.

**Real-Time — Incident Response**
Monitor for: harsh braking (accelerometer), extended idle (fuel waste), unauthorized stops, speed violations, engine diagnostic codes. For critical events (breakdown, engine code): assess severity, locate rescue vehicle, generate reassignment plan, notify customers, create maintenance ticket.

**17:00 — Daily Fleet Report**
Total deliveries vs. planned. On-time rate. Miles vs. optimized estimate. Fuel per vehicle. Driver scorecards. Vehicle health flags. Cost per delivery. Improvement recommendations.

### Deployment Scenario

**Operation:** Regional distributor, 35 vehicles, 400 daily deliveries, 3-state service area.

**Before BeePro:** Dispatchers manually plan routes in the morning. No live re-routing. Breakdowns cause cascading delays. On-time rate: 84%. Average 3 missed delivery windows per day.

**After BeePro:** Automated route optimization. Live re-routing on traffic and incidents. Vehicle 11 breaks down at 10:42 — agent reassigns all deliveries in 90 seconds, zero missed windows. On-time rate: 96%. Fuel savings: 12% (optimized routing). Driver safety events down 30% (real-time coaching).

**ROI:** $599 device + $79/mo × 12 = $1,547/year. Fuel savings: $42,000/year. Missed delivery reduction: $18,000/year. ROI: 38x.

---

## 3. Industrial Agent

### Mission
Predictive maintenance, machine health monitoring, and operational intelligence for manufacturing.

### Inputs

| Source | Protocol | Frequency |
|--------|----------|-----------|
| PLCs (machine state, counters) | OPC-UA/Modbus | Every 1-5s |
| Vibration sensors | MQTT/Modbus | Every 10s |
| Current/voltage monitors | Modbus | Every 5s |
| Temperature (bearing, motor) | Modbus/MQTT | Every 30s |
| Pressure (hydraulic, pneumatic) | Modbus | Every 5s |
| Production counters | OPC-UA | Event-driven |
| MES (work orders, batch data) | REST API | Event-driven |
| CMMS (maintenance history) | REST API | Poll 15min |
| Operator queries (SOP lookup) | Tablet/terminal UI | On-demand |

### Outputs

| Output | Destination |
|--------|-------------|
| Machine health scores (0-100) | Production floor display |
| Predictive maintenance alerts | CMMS + maintenance team |
| SOP assistant responses | Operator tablet |
| Shift handover reports | Incoming shift lead |
| OEE calculations | MES/dashboard |
| Downtime root cause analysis | Plant manager |
| Safety alerts | Floor supervisors |
| Hedera receipts | HCS topic |

### Daily Workflows

**Continuous — Machine Health Scoring**
Every 5 seconds per machine: read vibration, temp, current, pressure. Calculate derived metrics (RMS trend, spectral peaks, phase imbalance, leak rate). Compare to machine-specific baselines (learned during first 30 days, load-adjusted, season-adjusted). Output health score 0-100.

80-100: Normal. 60-79: Watch (increase monitoring). 40-59: Warning (schedule PM this week). 20-39: Critical (24-hour maintenance). 0-19: Emergency (stop machine).

**On-Demand — SOP Assistant**
Operator asks a question via tablet mounted on machine. Agent retrieves relevant SOP from vector DB (all machine manuals embedded). Checks machine state (is it locked out?). Provides step-by-step procedure with safety warnings. Logs query for training data.

**Shift Boundaries — Handover Report**
Auto-generated shift summary: production count vs. target, quality (reject rate), downtime events with causes, machine health changes, maintenance activity, safety incidents, carry-forward items for next shift.

### Deployment Scenario

**Facility:** Automotive parts manufacturer. 24 CNC machines, 6 presses, 3 assembly lines. 3 shifts, 24/7 operation.

**Before BeePro:** Maintenance is reactive. Unplanned downtime: 47 hours/month. Average cost per downtime event: $5,200 (lost production + emergency parts + overtime). Monthly cost: $62K+.

**After BeePro:** Vibration analysis detects bearing defect on Conveyor C7 — 18 days before failure. Replacement scheduled during planned maintenance. Hydraulic pressure drop on Press 4 detected at onset — self-recovery confirmed, but tracked. Unplanned downtime drops to 12 hours/month. Savings: $35K+/month.

**ROI:** $599 + $79/mo × 12 = $1,547/year. Savings: $420K/year. ROI: 271x.

---

## 4. Supply Chain Agent

### Mission
Procurement intelligence, inventory optimization, vendor management, and document processing for supply chain operations.

### Inputs

| Source | Protocol | Frequency |
|--------|----------|-----------|
| ERP (inventory, POs, invoices) | REST/ODBC | Every 15min |
| WMS (warehouse positions) | REST API | Real-time |
| Sales/CRM (orders, forecasts) | REST API | Hourly |
| Vendor portals | API/scraping | Daily |
| Shipping carriers (tracking) | API | Event-driven |
| Accounts payable | ERP/API | Daily |
| Documents (POs, invoices, BOLs) | File system/email | Event-driven |

### Outputs

| Output | Destination |
|--------|-------------|
| Reorder recommendations | Procurement dashboard |
| Demand forecasts (90-day) | Planning team |
| Vendor scorecards | Procurement manager |
| Invoice exception alerts | AP team |
| Document extraction (structured data) | ERP |
| Cost anomaly alerts | Finance |
| Hedera receipts | HCS topic |

### Daily Workflows

**06:00 — Inventory Scan**
Pull current stock from WMS. Pull 90-day consumption. Calculate days of supply, safety stock, reorder points. Generate reorder list with recommended quantities, preferred vendors, and price validation against contracts. Flag items below 3-day supply as critical.

**Continuous — Document Processing**
New document arrives (email, file drop, EDI). Agent classifies type (PO, invoice, BOL, contract). Extracts structured data using local LLM. Runs three-way match (PO vs. receipt vs. invoice). Approves matches for payment. Flags discrepancies: price mismatches, quantity differences, missing documents, suspicious patterns (wrong bank details, format anomalies, domain mismatches).

**Weekly — Vendor Scorecards**
Calculate per-vendor: on-time rate, quality rate, price consistency, lead time reliability. Trend analysis (is this vendor degrading?). Flag vendors below threshold. Recommend alternatives from approved vendor list.

**Monthly — Demand Forecast**
24-month historical + seasonality + sales pipeline + market data. Generate 90-day rolling forecast with confidence intervals. Identify forward-buying opportunities (commodity price trends).

### Deployment Scenario

**Operation:** Food distributor, 3,000 SKUs, 200 vendors, $40M annual procurement.

**Before BeeMini:** 2 full-time procurement analysts doing manual reorder calculations. Invoice processing: 4 hours/day. Annual invoice discrepancy losses: ~$180K (pricing errors, duplicate payments, missed early-pay discounts).

**After BeeMini:** Auto-reorder recommendations cover 90% of SKUs. Invoice processing: fully automated with exception routing. Catches fraudulent invoice (mismatched bank routing) within 4 minutes — prevents $28K loss. Annual savings: $220K (labor + error reduction + early-pay capture).

**ROI:** $249 + $49/mo × 12 = $837/year. Savings: $220K/year. ROI: 262x.

---

## 5. Agent Orchestrator

### Mission
Manage all agents on the appliance. Allocate resources. Coordinate actions. Secure operations. Bridge to cloud.

### Architecture

```
ORCHESTRATOR
├── Task Scheduler
│   ├── Cron jobs (compliance reports at 17:00)
│   ├── Interval tasks (sensor reads every 30s)
│   ├── Event triggers (new document → process)
│   └── Chained tasks (anomaly → report → alert → receipt)
│
├── Resource Manager
│   ├── GPU scheduling (priority preemption)
│   ├── Memory allocation (model weights pinned, KV cache managed)
│   ├── Storage (ring buffers, retention policies)
│   └── Thermal management (throttle at 85C)
│
├── Security Manager
│   ├── Device identity (TPM certificate + Hedera DID)
│   ├── Agent permissions (manifest-based, deny-by-default)
│   ├── Audit logging (tamper-evident, hash-chained)
│   └── Threat detection (unusual tool calls, network anomalies)
│
├── Message Bus (local IPC)
│   ├── Inter-agent communication
│   ├── Event pub/sub (anomaly events, status changes)
│   └── Request/response (supply chain asks cold storage for temp data)
│
├── Hedera Interface
│   ├── Receipt submission (HCS messages)
│   ├── Agent registration (updates to registry)
│   ├── Offline queue (batch submit when connected)
│   └── Verification (prove receipt authenticity)
│
└── Watchdog
    ├── Agent health checks (every 60s)
    ├── Auto-restart on crash (3 attempts, then disable + alert)
    ├── Model quality check (detect garbage output)
    └── Self-diagnostics (GPU, disk, network, sensors)
```

### Inter-Agent Scenario

Industrial agent detects CNC Mill 2 is down for 4-hour repair:
1. Industrial → Orchestrator: "CNC-2 down, 4hr estimated, 200 units of Part X shortfall"
2. Orchestrator routes to Supply Chain agent
3. Supply Chain: adjusts demand forecast, holds outbound shipment #4521, notifies customer portal of revised delivery (+1 day)
4. Orchestrator logs the chain of actions
5. Each action generates a Hedera receipt
6. Shift handover report auto-includes the incident chain

No human touched any of this. The orchestrator coordinated three systems (production, supply chain, customer) in response to one event.

---

# PART 6 — Hedera AI Studio Integration

## Overview

Hedera AI Studio provides the trust, identity, and verification layer for autonomous AI agents operating in regulated industries. Every BeeMini appliance integrates with Hedera natively.

## Agent Identity (DID)

Every deployed agent has a Decentralized Identifier (DID) anchored to Hedera.

**Structure:**
```
did:hedera:mainnet:{operator_account}/{agent_type}-{version}-{serial}

Example:
did:hedera:mainnet:0.0.10291827/cold-storage-v2.3-SB04821
```

**Identity Record (stored on HCS topic):**
```json
{
  "did": "did:hedera:mainnet:0.0.10291827/cold-storage-v2.3-SB04821",
  "agent_type": "cold-storage",
  "version": "2.3.1",
  "model": {
    "base": "swarm-cold-4b",
    "lora": "v2.3",
    "lora_cid": "ipfs://bafkreig...",
    "lora_hash": "sha256:a1b2c3d4..."
  },
  "appliance": {
    "serial": "SB-MINI-04821",
    "tier": "BeeMini",
    "site": "chi-warehouse-7"
  },
  "capabilities": [
    "sensor.read", "alert.send", "report.generate",
    "ticket.create", "escalate"
  ],
  "owner": "0.0.10291542",
  "deployed_at": "2026-02-24T00:00:00Z",
  "updated_at": "2026-02-24T00:00:00Z",
  "status": "active"
}
```

**Lifecycle:**
- DEPLOY: Identity created on HCS, registered in agent registry
- UPDATE: LoRA version changes, new identity record with updated model hash
- DECOMMISSION: Status set to "inactive", final audit record submitted

## Agent Registry

All agents are tracked in an HTS-backed registry.

**Hedera Components:**

| Component | Token/Topic | Purpose |
|-----------|-------------|---------|
| Agent Registry Topic | HCS `0.0.XXXXXXX` | Ordered log of all agent deployments and updates |
| Agent NFT Collection | HTS `0.0.XXXXXXX` SFAGENT | One NFT per deployed agent instance |
| Receipt Topic | HCS `0.0.10291838` (existing PoE) | Execution receipts from all agents |
| Model Registry | HTS `0.0.10291842` SFMOD (existing) | Model version tracking |

**Registry Query:**
An enterprise fleet manager can query the registry to answer:
- How many cold storage agents are deployed across my 50 sites?
- What model version is running on site chi-warehouse-7?
- When was the last model update pushed to my fleet?
- Show me all execution receipts from agent SB-04821 in the last 30 days.

**Interoperability:**
Because the registry is on Hedera (public, permissionless reads), third parties can verify agent identities:
- An auditor can independently verify which agent version produced a compliance report
- An insurance provider can confirm continuous monitoring was active during a claim period
- A regulatory body can audit the complete lifecycle of an AI agent making autonomous decisions

## Execution Receipts

Every critical agent action produces a signed receipt anchored to Hedera Consensus Service.

**Receipt Structure:**
```json
{
  "receipt_id": "r-2026-02-24-02-18-42-847291",
  "agent_did": "did:hedera:mainnet:0.0.10291827/cold-storage-v2.3-SB04821",
  "action": "anomaly_detected",
  "category": "safety",
  "timestamp": "2026-02-24T02:18:42.000Z",
  "inputs_hash": "sha256:...",
  "output_hash": "sha256:...",
  "decision": "alert_sent",
  "confidence": 0.92,
  "model_version": "swarm-cold-4b-lora-v2.3",
  "escalated": false,
  "tools_invoked": ["sensor.read", "alert.send", "ticket.create"],
  "site": "chi-warehouse-7",
  "appliance": "SB-MINI-04821"
}
```

**What gets receipts:**
- Anomaly detection events (temperature excursion, machine fault)
- Compliance report generation (daily FDA reports)
- Alert actions (SMS/email sent to maintenance)
- Escalation events (query sent to HQ model)
- Model updates (new LoRA adapter loaded)
- Configuration changes (thresholds modified)

**What does NOT get receipts:**
- Routine sensor readings (too frequent, no decision made)
- Normal status checks (no action taken)
- Internal agent housekeeping

**Cost:** $0.0001 per HCS message. A busy cold storage agent generating 50 receipts/day = $0.005/day = $1.83/year. Negligible.

**Verification Flow:**
```
1. FDA auditor requests: "Show me all actions by agent SB-04821 on Feb 24"
2. Fleet manager queries HCS topic for receipts matching agent DID + date
3. Returns: 47 receipts (3 anomaly detections, 1 daily report, 43 routine checks)
4. Auditor can independently verify:
   a. Each receipt timestamp (HCS consensus timestamp, not device clock)
   b. Each model version (cross-reference with agent registry)
   c. Each action (what tools were invoked)
   d. Data integrity (input/output hashes — data stays local, but integrity is provable)
```

## The Trust Architecture

```
LOCAL (Device)                    GLOBAL (Hedera)
─────────────                    ────────────────
Raw data stays here              Agent identity registered
Inference happens here           Execution receipts anchored
Actions executed here            Model versions tracked
Documents generated here         Audit trail immutable

     ──── PRIVACY BOUNDARY ────

Data never crosses.
Proof always crosses.
```

**The key insight:** You don't need to send your data to the cloud to prove your AI agent is working correctly. You just need to prove *that* it worked, *when* it worked, *which version* worked, and *what decision* it made. That's what goes on-chain. The actual data — your temperatures, your invoices, your machine readings — stays on your device.

---

# PART 7 — Hub & Spoke Intelligence

## Architecture

```
                    ┌────────────────────────────┐
                    │        SWARM HQ            │
                    │                            │
                    │  128x RTX PRO 6000         │
                    │  12TB VRAM                 │
                    │                            │
                    │  - 14B/32B/70B models      │
                    │  - Fleet management        │
                    │  - Model training (LoRA)   │
                    │  - Cross-site analytics    │
                    │  - Hedera anchoring        │
                    └─────────────┬──────────────┘
                                  │
                    WireGuard VPN │ mTLS
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
  ┌─────▼───────┐          ┌─────▼───────┐          ┌─────▼───────┐
  │ SITE A      │          │ SITE B      │          │ SITE C      │
  │ BeeMini     │          │ BeePro      │          │ BeeMini     │
  │             │          │             │          │             │
  │ Cold Storage│          │ Industrial  │          │ Logistics   │
  │ 4B model    │          │ + Supply    │          │ 4B model    │
  │             │          │ 8B model    │          │             │
  │ 97% local   │          │ 94% local   │          │ 98% local   │
  │ 3% escalate │          │ 6% escalate │          │ 2% escalate │
  └─────────────┘          └─────────────┘          └─────────────┘
```

## Escalation Flow

```
1. Agent encounters query with confidence < 0.6
2. Agent packages: {query, structured_context, confidence, priority}
   (NO raw data — only summarized, anonymized context)
3. Orchestrator routes to Escalation Gateway
4. Gateway sends via mTLS gRPC to HQ
5. HQ routes to appropriate model (14B for domain queries, 70B for complex reasoning)
6. HQ model returns structured response
7. Local agent executes response using local tools
8. Escalation logged for training data (becomes next LoRA update)
9. Hedera receipt generated for the escalation event
```

## Privacy Boundary

| Data Type | Crosses Boundary? | Direction |
|-----------|-------------------|-----------|
| Raw sensor data | Never | — |
| Customer/employee PII | Never | — |
| Documents (invoices, POs) | Never | — |
| Machine proprietary data | Never | — |
| Device health metrics | Yes | Edge → HQ |
| Inference statistics | Yes | Edge → HQ |
| Anonymized escalation queries | Yes | Edge → HQ |
| Escalation responses | Yes | HQ → Edge |
| Model updates (LoRA) | Yes | HQ → Edge |
| Configuration changes | Yes | HQ → Edge |
| Hedera receipts | Yes | Edge → Hedera |

## Cost Optimization

**Target economics per device:**

| Line Item | Monthly Cost |
|-----------|-------------|
| Local inference (electricity) | $5 |
| Cloud escalation (500 queries × $0.003) | $1.50 |
| Hedera receipts (50/day × $0.0001 × 30) | $0.15 |
| Fleet infrastructure allocation | $3 |
| **Total operational cost** | **$9.65/mo** |

**Against $49/mo software subscription: 80% gross margin.**

**The improvement flywheel:**
Every escalation is a training signal. Monthly LoRA retraining on escalation patterns. New adapter pushed to fleet. Escalation rate drops:
- Month 1: 5%
- Month 6: 3%
- Month 12: 1.5%
- Month 24: <1%

Every new device makes every existing device smarter (more training data → better model → fewer escalations).

---

# PART 8 — Fleet Deployment Model

## Provisioning Flow

```
DAY 0: ORDER
├─ Customer selects tier + agents + quantity
├─ Payment processed
└─ Device allocated from inventory

DAY 1: CONFIGURE
├─ Device identity provisioned (TPM enrollment + Hedera DID)
├─ WireGuard credentials generated
├─ Agent manifest built (which agents, which integrations)
├─ Model loaded (base + LoRA for customer's vertical)
├─ Knowledge pack loaded (vector embeddings)
├─ 8-hour burn-in test (thermal + inference quality)
├─ Hedera: agent identity registered on-chain
└─ QR code printed with device credentials

DAY 2: SHIP
├─ Pre-configured device + quick-start guide
├─ Power supply + Ethernet cable + mount bracket
├─ Sensor adapter cables (if applicable)
├─ Sealed credential envelope

DAY 3: INSTALL
├─ Customer plugs in Ethernet + power
├─ 45-second boot → auto-connects to HQ
├─ Fleet dashboard: "SB-MINI-04821 ONLINE"
├─ Customer scans QR → opens local web UI
├─ Guided wizard:
│   ├─ Confirm network
│   ├─ Configure sensors (auto-discovery)
│   ├─ Set alert recipients
│   ├─ Enter integration credentials
│   └─ System check (sensors, inference, HQ, Hedera)
├─ Status: OPERATIONAL
└─ First Hedera receipt: "Agent deployed and operational"
```

## Remote Updates

**Model Updates (LoRA):**
- Frequency: weekly to monthly
- Size: 50-200 MB
- Downtime: zero (hot-swap)
- Process: staged rollout (5% → 25% → 100%), quality gate on device, auto-rollback

**OS Updates:**
- Frequency: monthly or security advisory
- Size: 10-100 MB
- Downtime: 45 seconds (A/B partition reboot)
- Process: signed package, inactive partition write, auto-revert on failure

## Monitoring

**Fleet Dashboard:**
```
FLEET OVERVIEW
  Total devices:  847
  Online:         839 (99.1%)
  Agents active:  1,247

PER DEVICE:
  SB-MINI-04821 | Cold Storage v2.3 | Chicago, IL
  Uptime: 47 days | Inferences today: 4,821
  Escalation rate (30d): 2.1%
  GPU: 52C | Disk: 34% | Health: Normal
  Hedera receipts today: 47
  Last alert: Zone B temp watch (resolved 02:45)
```

## Billing

| Component | Price | Notes |
|-----------|-------|-------|
| BeeMini hardware | $249 one-time | Or $29/mo lease |
| BeePro hardware | $599 one-time | Or $69/mo lease |
| BeeRack | $3,500/mo all-in | |
| SwarmOS + 1 agent | $49/mo | Fleet mgmt + updates + 500 escalations |
| Additional agent | $29/mo each | |
| Priority support | $99/mo | 4-hour response, dedicated CSM |
| Custom LoRA training | $5K-$50K | Per project |

**Enterprise Tiers:**

| Tier | Devices | Discount | Includes |
|------|---------|----------|----------|
| Starter | 1-10 | — | Standard support |
| Growth | 11-50 | 10% | Priority support, quarterly review |
| Enterprise | 51-200 | 20% | Dedicated CSM, custom training, SLA |
| Fleet | 200+ | Custom | Everything, co-development |

## Enterprise Lifecycle

**Phase 1: Pilot (1-3 devices, 30-90 days)**
Single site. Configure for customer systems. Weekly check-ins. Measure accuracy and false positive rate. Define success criteria.

**Phase 2: Site Rollout (5-20 devices, 3-6 months)**
Full facility deployment. Multiple agents. Custom LoRA trained on customer patterns. Full integration with CMMS/ERP/TMS.

**Phase 3: Fleet (20-200+, ongoing)**
Multi-site. Standardized provisioning. Cross-site analytics at HQ. Dedicated CSM. Quarterly business reviews with ROI.

**Phase 4: Strategic (200+)**
Dedicated training pipeline. Custom agent development. Multi-year contract. Joint roadmap.

---

# PART 9 — Future Roadmap

## 2026 H1: Foundation
- 5 vertical agents shipped
- 3 hardware tiers available
- Fleet management live
- Hedera integration live
- 10-50 pilot deployments

## 2026 H2: Agent Marketplace
- Agent SDK published (Python)
- Third-party developers build and sell agents
- Review process (security audit + quality gate)
- Revenue share: 70/30 (developer/platform)
- Categories: compliance, quality, energy, security, vertical-specific

## 2027 H1: Skill Plugins
- Lightweight capability add-ons (tool + micro-LoRA)
- Install via fleet management
- "Add HACCP compliance skill to all cold storage agents"
- Stacking: 5-10 skills per agent

## 2027 H2: Training Flywheel
- Fleet-wide anonymized training signal
- Monthly model retraining at Swarm HQ (128x RTX PRO 6000)
- Escalation rate drops from 5% → <1%
- Network effect: every new device improves every existing device

## 2028: Global Fleet
- Regional HQ nodes (US, EU, APAC)
- 10,000+ devices deployed
- Multi-language support
- OEM/white-label program
- Channel partner distribution

## 2029+: Category Definition
- 100,000+ devices
- Industry standard for autonomous operations
- Regulatory pre-certification (FDA, OSHA, EPA)
- Insurance integration (automated compliance = lower premiums)
- Appliance-as-a-Service (pure SaaS economics)

---

# Summary

The Last-Mile AI Appliance is the physical execution layer of the agent economy. It takes AI out of the cloud and puts it where the work happens.

**The device:** BeeMini. $249. 10 watts. Runs 24/7. Fits on a DIN rail.

**The intelligence:** Fine-tuned 4B model. 30+ tok/s. 95% local. 5% cloud escalation.

**The trust:** Hedera-backed agent identity, execution receipts, and audit trails. Agents act locally, verified globally.

**The business:** $49/mo per device. 80% gross margin. 59x-271x customer ROI across verticals.

**The vision:** Every business that runs physical operations gets an AI appliance. Same category logic as routers for networking, NAS for storage, POS for payments.

Cloud AI thinks. Edge AI does. We build the edge.

---

*Swarm & Bee — Last mile intelligence.*
*Your data never leaves your rack.*
