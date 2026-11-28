# 0002: Neon Postgres as the database

- **Status:** accepted (2026-11-28)
- **Date:** 2026-11-28
- **Supersedes:** none

## Context

The app needs to store learner state (conversations, mistake history, drill progress) and, for
RAG, embeddings of curated notes. The budget is about $10 in total, the owner works 5 to 10 hours
a week (so the database sits idle for days), and one learning goal is data architecture.

AWS accounts created after 15 July 2025 on the Free plan get credits and close after 6 months
unless upgraded; only "always free" allowances stay free after that
([freetier.co](https://freetier.co/articles/aws-free-tier-changes-july-15-2025)).

## Options considered

1. **DynamoDB:** always free at our scale (25 GB, 25 RCU and 25 WCU,
   [pricing](https://aws.amazon.com/dynamodb/pricing/)). But NoSQL modelling is hard to change,
   history queries are awkward, and there is no vector search, so RAG needs a second store.
2. **RDS Postgres (t4g.micro):** standard Postgres on AWS, but free only on credits, never scales to
   zero, and needs a VPC ([RDS free tier](https://aws.amazon.com/rds/free)).
3. **Aurora Serverless v2 Postgres:** AWS-native, free plan up to 4 ACU and 1 GiB, but credits only
   ([Aurora free tier](https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-aurora-postgresql-aws-free-tier)).
4. **Neon Postgres:** permanent free plan (1 GB per project, 100 compute hours a month, suspends
   after 5 minutes idle), pgvector on all plans, a database branch per PR
   ([Neon pricing](https://neon.com/pricing)). A second vendor outside AWS.
5. **Supabase:** database and auth together, but free projects pause after a week of inactivity
   and Pro is $25 a month ([Supabase pricing](https://supabase.com/pricing)).

## Decision

Use Neon Postgres, with pgvector, for application data and RAG embeddings. Chosen by the owner on
2026-11-28.

## Consequences

- One store for relational data and vectors; SQL and schema design are part of the learning.
- Two Neon projects, one per environment: `vaikhari-dev` (its `main` branch is the dev database,
  plus a short-lived branch per PR) and `vaikhari-prod` (only `main`). Each project has its own
  credentials, compute allowance and Neon Auth users, so dev work can neither read prod data nor use
  up prod's free compute hours. Migrations run against each project separately. Check the free
  plan's project limit when setting up.
- "Everything on AWS" no longer holds. The app runs on AWS and calls Neon over the internet. Pick a
  Neon region close to the app's AWS region.
- Services reach the database only through repository interfaces (architecture guide), so moving to
  RDS or Aurora later means swapping adapters, not rewriting services.
- Schema changes go through migrations; the migration tool is chosen when the first table lands
  (it falls under the new-technology gate: it needs its own style section).
- Free plan limits (1 GB, 100 compute hours) are watched; past them, the paid plan is
  pay-as-you-go, about $15 a month for a small intermittent database by Neon's estimate.
