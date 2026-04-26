# Project Purpose Review

## What This Project Is
This project is an AI-assisted job application management platform ("JobSync AI") with:
- A Next.js frontend client for user interaction
- A NestJS backend API for authentication, data handling, and AI workflows
- A PostgreSQL database via Prisma for persistent user/job/resume records

## Core Product Goal
Help job seekers organize and accelerate their application process by combining:
- Manual job tracking (CRUD for job applications)
- Gmail ingestion to detect and import job-related email updates
- AI-powered resume tailoring for specific job descriptions

In short, the product aims to be a personal "job search copilot".

## Primary User Journey
1. User registers or logs in (email/password, with optional Google auth flow).
2. User opens dashboard to manage application pipeline.
3. User adds/edit/deletes jobs manually.
4. User connects Gmail and triggers sync to auto-detect job-related emails.
5. System uses local LLM service (Ollama) to extract company, role, and status from email snippets.
6. User uploads a resume + pastes a target job description.
7. System rewrites resume text via Ollama and returns an optimized PDF for download.

## Current Implemented Capabilities
- JWT-based auth with protected endpoints
- Google OAuth callback handling
- Job tracking API with per-user data isolation
- Gmail connection status and manual sync endpoint
- AI extraction of job metadata from emails
- Resume upload (PDF/DOCX), text extraction, AI optimization, PDF generation
- Basic frontend screens for login/register/dashboard and operational actions

## Data Model Intent (Prisma)
- User: identity + optional Google refresh token linkage
- Job: application status timeline, with dedup support via source email id
- Resume: original and optimized file references

## Architecture Summary
- Client (Next.js): UI, local token storage, API calls
- Server (NestJS): auth, business logic, integrations, file handling
- DB (PostgreSQL + Prisma): application and user data
- AI layer (Ollama): structured extraction + resume rewriting
- External integration: Gmail API via Google OAuth credentials

## Current Maturity Assessment
This looks like an MVP/prototype with real feature wiring already in place. It is beyond scaffold level, but still appears pre-production due to:
- Starter landing page still present
- Default README files not yet customized
- Some security/operational hardening likely still needed (for example token handling strategy, upload lifecycle, and stricter DTO validation coverage)

## Suggested Next Documentation Files
- Product requirements/spec (target users, KPIs, roadmap)
- Setup guide with exact env variables (Google, DB, Ollama, web origins)
- Deployment guide (client + server + DB + Ollama topology)
- Security notes (token storage, secrets management, file retention policy)

## Information That Would Help Me Next
If you want, I can prepare a stronger technical review next. For that, share:
- Your intended production environment (cloud/local/hybrid)
- Exact security expectations (MVP vs production-grade)
- Whether Gmail sync should run manually only or also scheduled
- Whether resume files must be retained, versioned, or auto-deleted
- Any roadmap priorities (features to build first)
