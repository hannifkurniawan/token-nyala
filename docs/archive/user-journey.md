# User Journey Diagram

## Diagram 1 — Current Problem Journey

```mermaid
flowchart LR
    A[User finds AI platform] --> B[Sees model names, limits,
and API terminology]
    B --> C[Cannot map package
to project needs]
    C --> D{Understands enough
to choose?}
    D -->|No| E[Hesitates or leaves]
    D -->|Yes| F[Starts purchasing]
    F --> G[Activation and balance
remain unclear]
    G --> H[Abandoned checkout or
low confidence]

    style E fill:#F5C1C1,stroke:#002DBB
    style H fill:#F5C1C1,stroke:#002DBB
```

## Diagram 2 — Ideal Journey

```mermaid
flowchart TD
    A[Arrive from social media,
recommendation, or search] --> B[See benefit-led hero:
Top up AI credit for building]

    B --> C{Does user find
value immediately?}
    C -->|No| X1[Reviews explanation,
examples, and trust cues]
    X1 --> C
    C -->|Yes| D[Choose project intent]

    D --> D1[Learn]
    D --> D2[Prototype]
    D --> D3[Work]

    D1 --> E[Recommended entry package]
    D2 --> E
    D3 --> E

    E --> F[Compare visible details:
price, bonus, estimate, validity]
    F --> G{Package feels right?}
    G -->|No| D
    G -->|Yes| H[Open checkout]

    H --> I[Enter email or phone and
choose payment method]
    I --> J[Review transparent
price breakdown]
    J --> K[Confirm purchase]

    K --> L{Payment successful?}
    L -->|No| M[Show retry or payment
support message]
    M --> I
    L -->|Yes| N[Confirmation and
activation status]

    N --> O[Return to building]
    O --> P[Receive usage or balance
reminder]

    style B fill:#FFC93C,stroke:#00166A
    style D fill:#5CD0F9,stroke:#00166A
    style H fill:#00D2A0,stroke:#00166A
    style N fill:#00D2A0,stroke:#00166A
    style X1 fill:#F7F8FC,stroke:#69728A
    style E fill:#5CD0F9,stroke:#002DBB
```

## Persona-Specific Journey Path

```mermaid
flowchart LR
    AYU[Ayu — Tingkatan 1] --> AYU1[Needs confidence
and simple guidance]
    AYU1 --> AYU2[Choose Learn or Prototype]
    AYU2 --> AYU3[Buy Rp50K–Rp100K]

    RAKA[Raka — Tingkatan 2] --> RAKA1[Needs speed,
value, and receipt]
    RAKA1 --> RAKA2[Choose Prototype or Work]
    RAKA2 --> RAKA3[Buy Rp100K–Rp250K]

    DIMAS[Dimas — Tingkatan 3] --> DIMAS1[Needs control,
invoice, and visibility]
    DIMAS1 --> DIMAS2[Choose Work or Growth]
    DIMAS2 --> DIMAS3[Buy Rp250K–Rp1M]

    AYU3 --> CHECKOUT[Unified checkout]
    RAKA3 --> CHECKOUT
    DIMAS3 --> CHECKOUT

    CHECKOUT --> SUCCESS[Balance ready]

    style AYU fill:#5CD0F9,stroke:#00166A
    style RAKA fill:#FFC93C,stroke:#00166A
    style DIMAS fill:#00D2A0,stroke:#00166A
    style CHECKOUT fill:#F7F8FC,stroke:#69728A
    style SUCCESS fill:#00D2A0,stroke:#00166A
```

# Current and Ideal User Journeys

## Current Problem Journey

1. User sees a technical AI platform.
2. User encounters model names, limits, or API terms.
3. User does not know which package maps to their project.
4. User hesitates or leaves.
5. If purchasing, activation and usage remain unclear.

## Ideal Journey — New Vibe-Coder

### 1. Awareness
User arrives from social media or a recommendation.

**Goal:** Understand what TokenNyala does in five seconds.

**Key message:** Top up AI credit for the apps and prototypes you are building.

### 2. Reassurance
User sees familiar project types and transparent examples.

**Questions answered:**
- Is this for me?
- How much should I buy?
- What payment methods are available?

### 3. Discovery
User chooses an intent: belajar, prototype, or project kerja.

**System response:** Recommended package and practical estimate.

### 4. Selection
User views nominal options and compares value.

**Visible information:** Price, bonus credit, estimated use range, validity.

### 5. Purchase
User enters email or phone number, chooses a mock payment method, and confirms.

**Trust cues:** Price breakdown, no hidden fees, secure-payment label, support link.

### 6. Confirmation
Success state explains activation and next steps.

**Key message:** Balance ready. One link to continue building.

## Drop-Off Risks

- Too many package options.
- Technical jargon before the package recommendation.
- Hidden delivery or payment fees.
- No clear estimate of usefulness.
- Lengthy account creation before top-up.
