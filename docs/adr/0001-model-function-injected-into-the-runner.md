# ADR 0001: Model function injected into the runner

Status: accepted

## Context

Runner logic must be testable without network.

## Decision

The runner takes a model function; the demo model and real providers share the interface.

## Consequences

Tests are fast and deterministic; providers are thin adapters.
