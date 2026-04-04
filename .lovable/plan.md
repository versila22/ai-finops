

# AI FinOps Dashboard — Implementation Plan

## Overview
A premium, multi-page AI spend cockpit with 6 screens, realistic mock data, and a clean fintech-inspired design system. Light theme with green/amber/red status colors and blue/indigo primary accents.

## Design System
- Light neutral base (`#F8F9FA` bg, white cards), dark text
- Primary: Indigo/blue for actions and highlights
- Status colors: Green (healthy), Amber (warning), Red (critical)
- Clean sans-serif typography, generous whitespace
- Consistent card-based layout with subtle shadows

## Navigation
Left sidebar with icon + label, collapsible to icon-only mode. Routes: Dashboard, Providers, Alerts, Plans, Adjustments.

## Pages

### 1. Dashboard (Home)
- **KPI row**: Monthly Budget, Total Spend, Overage, Active Alerts, Underused Plans, Near Exhaustion
- **Alert summary panel**: Top 3-4 actionable alerts with severity badges
- **Provider summary cards/table**: Each provider with usage %, status chip, recommendation badge
- **Quota overview**: Compact progress bars per provider
- **Recommendations panel**: Actionable cards (downgrade ElevenLabs, watch OpenAI quota, etc.)

### 2. Providers List
- Table with columns: Provider, Category, Plan, Cost, Quota, Consumed, Remaining, Usage %, Overage, Reset Date, Sync Status, Recommendation
- Status chips and progress bars inline
- Click row → provider detail

### 3. Provider Detail (dynamic route)
- Plan summary card, quota progress (radial + bar), remaining credits
- Daily usage trend chart (recharts area/bar chart)
- Overage history section
- Sync status + last sync time
- Active alerts for this provider
- Manual adjustments history
- Recommendation card with suggested action

### 4. Alerts Center
- Tabs: Active / Resolved
- Table: Alert type, severity badge, provider, trigger date, description, recommended action
- Filter by severity or provider

### 5. Plans & Subscriptions
- Cards or table for all active plans
- Plan type badge (Monthly Quota vs Prepaid Credits)
- Cost, included quota, current usage progress, projected end-of-cycle status
- Next cycle recommendation badge

### 6. Manual Adjustments
- Form/modal to add adjustment (provider, type, amount, note)
- History table of past adjustments
- Data origin chips: Auto / Manual / Adjusted

## Mock Data (5 providers)
- **OpenAI** — Pro plan, 82% usage, near exhaustion alert
- **Anthropic** — API plan, healthy at 45% usage
- **Google AI/Vertex** — Prepaid credits, underused at 18%
- **ElevenLabs** — Monthly plan, €47 overage
- **Lovable** — Monthly plan, manual adjustment mode, 60% usage

## Reusable Components
- KPICard, StatusBadge, UsageProgressBar, RecommendationCard, AlertRow, ProviderRow, RadialProgress, SyncStatusChip, DataOriginChip

