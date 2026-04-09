# Development Environment Setup

<cite>
**Referenced Files in This Document**
- [Makefile](file://Makefile)
- [package.json](file://package.json)
- [CONTRIBUTING.md](file://CONTRIBUTING.md)
- [eslint.config.mjs](file://eslint.config.mjs)
- [vitest.config.ts](file://vitest.config.ts)
- [.pre-commit-config.yaml](file://.pre-commit-config.yaml)
- [scripts/install.sh](file://scripts/install.sh)
- [install.sh](file://install.sh)
- [scripts/debug.sh](file://scripts/debug.sh)
- [test/e2e/test-full-e2e.sh](file://test/e2e/test-full-e2e.sh)
- [tsconfig.src.json](file://tsconfig.src.json)
- [tsconfig.cli.json](file://tsconfig.cli.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document provides a comprehensive guide to setting up a development environment for the NemoClaw ecosystem. It focuses on local development, testing, and contribution workflows, covering toolchain requirements, Makefile targets, installation procedures, sandbox setup, debugging, and testing strategies. It also includes practical workflows for code modification, IDE recommendations, and continuous integration integration.

## Project Structure
The repository is organized into multiple areas:
- Root CLI and installer logic under bin/ and scripts/
- NemoClaw TypeScript plugin under nemoclaw/
- Blueprint orchestration under nemoclaw-blueprint/
- Tests under test/
- Documentation under docs/
- Build and linting configuration files

```mermaid
graph TB
A["Root"] --> B["bin/ (CLI entrypoint)"]
A --> C["scripts/ (install helpers)"]
A --> D["nemoclaw/ (TypeScript plugin)"]
A --> E["nemoclaw-blueprint/ (Python blueprint)"]
A --> F["test/ (integration tests)"]
A --> G["docs/ (Sphinx/MyST docs)"]
A --> H["Makefile (tasks)"]
A --> I["package.json (Node toolchain)"]
A --> J[".pre-commit-config.yaml (hooks)"]
```

**Section sources**
- [CONTRIBUTING.md:86-98](file://CONTRIBUTING.md#L86-L98)

## Core Components
- Development tasks are orchestrated via Makefile targets for linting, formatting, and documentation building.
- Node.js and npm are the primary runtime and package managers; TypeScript compilation is handled by tsc with dedicated tsconfig files.
- Pre-commit hooks manage formatting, linting, and validation via prek.
- Vitest runs unit and integration tests across CLI, plugin, and E2E scopes.
- The installer automates Node.js, optional Ollama, and NemoClaw installation, including onboarding and sandbox creation.

**Section sources**
- [Makefile:1-34](file://Makefile#L1-L34)
- [package.json:9-20](file://package.json#L9-L20)
- [CONTRIBUTING.md:54-69](file://CONTRIBUTING.md#L54-L69)
- [eslint.config.mjs:6-14](file://eslint.config.mjs#L6-L14)
- [vitest.config.ts:6-38](file://vitest.config.ts#L6-L38)
- [.pre-commit-config.yaml:33-32](file://.pre-commit-config.yaml#L33-L32)

## Architecture Overview
The development environment integrates several layers:
- Toolchain: Node.js, npm, TypeScript, ESLint, Prettier, Vitest, Sphinx, uv
- Local sandbox: OpenShell-managed sandbox with gateway and policy enforcement
- Installer: Bootstraps runtime, optional inference stack, and NemoClaw CLI
- Hooks and CI: Pre-commit hooks and CI jobs enforce quality gates

```mermaid
graph TB
subgraph "Local Dev"
MK["Makefile"]
PC[".pre-commit-config.yaml"]
VT["Vitest"]
ES["ESLint/Prettier"]
TS["TypeScript (tsc)"]
end
subgraph "Installer"
IS["scripts/install.sh"]
BS["install.sh (bootstrap)"]
end
subgraph "Sandbox Runtime"
OS["OpenShell"]
GW["Gateway"]
POL["Policies"]
end
MK --> ES
MK --> TS
MK --> VT
MK --> IS
PC --> ES
PC --> VT
IS --> OS
OS --> GW
GW --> POL
```

**Diagram sources**
- [Makefile:1-34](file://Makefile#L1-L34)
- [.pre-commit-config.yaml:33-248](file://.pre-commit-config.yaml#L33-L248)
- [scripts/install.sh:583-630](file://scripts/install.sh#L583-L630)
- [install.sh:109-121](file://install.sh#L109-L121)

## Detailed Component Analysis

### Makefile Targets and Development Tasks
Common development tasks are exposed via Makefile:
- Formatting and linting: format, format-ts, format-cli, lint, lint-ts
- Documentation: docs, docs-strict, docs-live, docs-clean
- Quality gate: check (runs pre-commit hooks across all files)

These targets coordinate with npm scripts and pre-commit hooks to maintain consistent code quality.

```mermaid
flowchart TD
Start(["Developer runs make task"]) --> Choose{"Which task?"}
Choose --> |format| Fmt["Run format targets<br/>Prettier + ESLint fixes"]
Choose --> |lint| Lint["Run lint targets<br/>TypeScript + JS lint"]
Choose --> |check| Check["Run pre-commit hooks<br/>--all-files"]
Choose --> |docs| Docs["Build docs with Sphinx"]
Fmt --> End(["Tasks complete"])
Lint --> End
Check --> End
Docs --> End
```

**Section sources**
- [Makefile:3-33](file://Makefile#L3-L33)
- [CONTRIBUTING.md:56-69](file://CONTRIBUTING.md#L56-L69)

### Node.js and TypeScript Toolchain
- Node.js and npm requirements are enforced by the installer and package manifest.
- TypeScript configurations:
  - tsconfig.src.json: plugin sources compiled to dist
  - tsconfig.cli.json: CLI and scripts type-checking
- ESLint configuration applies to bin/, scripts/, and test/ with language-specific globals and rules.

```mermaid
flowchart TD
A["package.json engines"] --> B["Ensure Node.js >= required"]
B --> C["tsc (tsconfig.src.json)"]
B --> D["tsc (tsconfig.cli.json)"]
C --> E["nemoclaw/dist/"]
D --> F["CLI type-check"]
A --> G["ESLint (eslint.config.mjs)"]
G --> H["Formatting + Linting"]
```

**Section sources**
- [package.json:38-40](file://package.json#L38-L40)
- [tsconfig.src.json:1-21](file://tsconfig.src.json#L1-L21)
- [tsconfig.cli.json:1-21](file://tsconfig.cli.json#L1-L21)
- [eslint.config.mjs:16-103](file://eslint.config.mjs#L16-L103)

### Pre-commit Hooks and Quality Gates
- Pre-commit hooks are managed by prek and configured in .pre-commit-config.yaml.
- Hook priorities group tasks (file fixers, SPDX headers, formatters, linters, tests, coverage).
- Commit message linting enforces Conventional Commits.
- Pre-push hooks include TypeScript type checks and coverage thresholds.

```mermaid
sequenceDiagram
participant Dev as "Developer"
participant Git as "Git"
participant Prek as "prek"
participant Hooks as "Hook Groups"
Dev->>Git : git commit
Git->>Prek : run hooks (commit-msg)
Prek->>Hooks : commitlint (Conventional Commits)
Hooks-->>Prek : pass/fail
Prek-->>Git : allow/abort
Dev->>Git : git push
Git->>Prek : run hooks (pre-push)
Prek->>Hooks : tsc (plugin + CLI)
Hooks-->>Prek : pass/fail
Prek-->>Git : allow/abort
```

**Section sources**
- [.pre-commit-config.yaml:1-248](file://.pre-commit-config.yaml#L1-L248)
- [CONTRIBUTING.md:70-84](file://CONTRIBUTING.md#L70-L84)

### Installer and Sandbox Setup
The installer automates:
- Runtime detection and Node.js installation via nvm
- Optional Ollama installation on GPU systems
- NemoClaw installation and onboarding
- Sandbox creation and policy configuration

```mermaid
flowchart TD
Start(["Run installer"]) --> CheckRuntime["Check Node.js/npm versions"]
CheckRuntime --> |OK| InstallNode["Install Node.js via nvm"]
CheckRuntime --> |Skip| DetectGPU["Detect GPU presence"]
InstallNode --> DetectGPU
DetectGPU --> |GPU| InstallOllama["Install/upgrade Ollama"]
DetectGPU --> |No GPU| SkipOllama["Skip Ollama"]
InstallOllama --> InstallNemo["Install NemoClaw"]
SkipOllama --> InstallNemo
InstallNemo --> Onboard["Run onboarding (interactive/non-interactive)"]
Onboard --> Sandbox["Create/Configure sandbox"]
Sandbox --> Done(["Ready"])
```

**Section sources**
- [scripts/install.sh:560-578](file://scripts/install.sh#L560-L578)
- [scripts/install.sh:634-715](file://scripts/install.sh#L634-L715)
- [scripts/install.sh:756-800](file://scripts/install.sh#L756-L800)
- [install.sh:109-121](file://install.sh#L109-L121)

### Testing Environment and Strategies
- Unit and integration tests:
  - Root tests under test/ run via npm test
  - Plugin tests under nemoclaw/src via npm run test
  - Vitest projects split by scope (cli, plugin, e2e-brev)
- Coverage reporting configured per project
- End-to-end tests validate full user journey with real inference

```mermaid
sequenceDiagram
participant Dev as "Developer"
participant Vitest as "Vitest"
participant CLI as "CLI Tests"
participant Plugin as "Plugin Tests"
participant E2E as "E2E Tests"
Dev->>Vitest : npm test / make check
Vitest->>CLI : run --project cli
Vitest->>Plugin : run --project plugin
Vitest->>E2E : run --project e2e-brev (conditional)
CLI-->>Dev : coverage + results
Plugin-->>Dev : coverage + results
E2E-->>Dev : pass/fail (external API)
```

**Section sources**
- [vitest.config.ts:6-38](file://vitest.config.ts#L6-L38)
- [CONTRIBUTING.md:56-69](file://CONTRIBUTING.md#L56-L69)
- [test/e2e/test-full-e2e.sh:1-379](file://test/e2e/test-full-e2e.sh#L1-L379)

### Debugging and Diagnostics
The debug script collects system, GPU, Docker, OpenShell, and sandbox diagnostics, with optional tarball output and secret redaction.

```mermaid
flowchart TD
Start(["Run debug.sh"]) --> Flags["Parse flags (--sandbox, --quick, --output)"]
Flags --> Sys["Collect system info"]
Sys --> Proc["Collect processes"]
Proc --> GPU["Collect GPU metrics"]
GPU --> Docker["Collect Docker info/logs"]
Docker --> OpenShell["Collect OpenShell status"]
OpenShell --> Sandbox["SSH into sandbox (if available)"]
Sandbox --> Net["Collect network info (full mode)"]
Net --> Kernel["Collect kernel/io messages"]
Kernel --> Tar["Write tarball (optional)"]
Tar --> End(["Done"])
```

**Section sources**
- [scripts/debug.sh:1-356](file://scripts/debug.sh#L1-L356)

### Contribution Workflow and Best Practices
- Prerequisites: Node.js 22.16+, npm 10+, Python 3.11+, Docker, uv, hadolint
- Build and test: npm install, build plugin, run tests, make docs
- Commit conventions: Conventional Commits enforced by commitlint
- Language policy: New source files must be TypeScript; migrate existing JS where feasible

```mermaid
flowchart TD
Start(["Fork and branch from main"]) --> Setup["Install prerequisites"]
Setup --> Build["npm install + build plugin"]
Build --> Test["npm test + make check"]
Test --> Docs["Update docs if applicable"]
Docs --> PR["Open PR for review"]
PR --> Review["Maintainer review and CI checks"]
Review --> Merge["Merge and close"]
```

**Section sources**
- [CONTRIBUTING.md:13-36](file://CONTRIBUTING.md#L13-L36)
- [CONTRIBUTING.md:168-225](file://CONTRIBUTING.md#L168-L225)

## Dependency Analysis
- Node.js runtime and npm versions are enforced by both installer and package manifest.
- TypeScript configurations isolate plugin vs CLI type-checking.
- Pre-commit hooks depend on external tools (ShellCheck, hadolint, gitleaks, markdownlint-cli2).
- E2E tests rely on Docker and external inference endpoints.

```mermaid
graph LR
Node["Node.js/npm"] --> TS["TypeScript"]
TS --> ESL["ESLint/Prettier"]
ESL --> PC[".pre-commit-config.yaml"]
PC --> Hooks["Pre-commit hooks"]
TS --> VT["Vitest"]
VT --> Tests["Unit/Integration/E2E"]
Docker["Docker"] --> E2E["E2E Tests"]
E2E --> Ext["External APIs"]
```

**Diagram sources**
- [package.json:38-40](file://package.json#L38-L40)
- [tsconfig.src.json:1-21](file://tsconfig.src.json#L1-L21)
- [tsconfig.cli.json:1-21](file://tsconfig.cli.json#L1-L21)
- [.pre-commit-config.yaml:147-175](file://.pre-commit-config.yaml#L147-L175)
- [test/e2e/test-full-e2e.sh:103-122](file://test/e2e/test-full-e2e.sh#L103-L122)

**Section sources**
- [package.json:38-40](file://package.json#L38-L40)
- [.pre-commit-config.yaml:147-175](file://.pre-commit-config.yaml#L147-L175)

## Performance Considerations
- Use pre-commit hooks to catch issues early and reduce CI failures.
- Keep TypeScript configurations optimized (exclude test files from plugin build).
- Prefer incremental builds and watch mode for iterative development.
- Limit E2E runs to environments with reliable network connectivity to external inference endpoints.

## Troubleshooting Guide
- Installer failures:
  - Verify Node.js/npm versions meet requirements.
  - Ensure nvm is sourced and PATH is refreshed after installation.
  - Check for GPU detection and Ollama minimum version compatibility.
- Sandbox connectivity:
  - Confirm Docker is running and OpenShell gateway is healthy.
  - Use the debug script to collect sandbox internals and gateway logs.
- E2E test failures:
  - Validate NVIDIA API key and network access to inference endpoints.
  - Review E2E logs and cleanup residual sandbox/gateway artifacts.

**Section sources**
- [scripts/install.sh:560-578](file://scripts/install.sh#L560-L578)
- [scripts/install.sh:634-715](file://scripts/install.sh#L634-L715)
- [scripts/debug.sh:274-298](file://scripts/debug.sh#L274-L298)
- [test/e2e/test-full-e2e.sh:103-132](file://test/e2e/test-full-e2e.sh#L103-L132)

## Conclusion
The NemoClaw development environment is designed for productivity and quality. By leveraging Makefile tasks, pre-commit hooks, TypeScript configurations, and comprehensive testing, contributors can efficiently develop, validate, and iterate on changes. The installer streamlines local sandbox setup, while the debug script provides robust diagnostics for troubleshooting.

## Appendices

### Practical Development Workflows
- Local development:
  - Install prerequisites and build the plugin.
  - Run unit tests and type checks.
  - Use formatting and linting targets before committing.
- Sandbox setup:
  - Run the installer in non-interactive mode with environment variables for automation.
  - Verify sandbox status and policy application.
- Local testing:
  - Execute root and plugin tests via npm test.
  - For E2E, ensure Docker and a valid NVIDIA API key are available.

**Section sources**
- [CONTRIBUTING.md:23-36](file://CONTRIBUTING.md#L23-L36)
- [CONTRIBUTING.md:56-69](file://CONTRIBUTING.md#L56-L69)
- [test/e2e/test-full-e2e.sh:16-26](file://test/e2e/test-full-e2e.sh#L16-L26)

### IDE Configuration Recommendations
- Enable ESLint and Prettier integrations for automatic formatting and linting on save.
- Configure TypeScript projects to use tsconfig.src.json for plugin and tsconfig.cli.json for CLI scripts.
- Set up Vitest integration to run and debug tests directly from the editor.

**Section sources**
- [eslint.config.mjs:16-103](file://eslint.config.mjs#L16-L103)
- [tsconfig.src.json:1-21](file://tsconfig.src.json#L1-L21)
- [tsconfig.cli.json:1-21](file://tsconfig.cli.json#L1-L21)
- [vitest.config.ts:6-38](file://vitest.config.ts#L6-L38)

### Continuous Integration Integration
- Pre-commit hooks enforce formatting, linting, and type checks locally.
- Pre-push hooks validate TypeScript builds and coverage thresholds.
- CI should mirror pre-commit and pre-push checks to maintain consistency.

**Section sources**
- [.pre-commit-config.yaml:176-248](file://.pre-commit-config.yaml#L176-L248)
- [CONTRIBUTING.md:70-84](file://CONTRIBUTING.md#L70-L84)