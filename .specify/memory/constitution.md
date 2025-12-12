<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0
- Initial constitution ratification for DeepEnd project
- 5 core principles established: Specification-First, Agent-Driven Workflow, Template Consistency, Version Control Integration, Structured Documentation
- Testing standard: Test-Driven Development (TDD) required
- Compliance: Standard software development practices
- Governance: Project maintainer(s) authority with formal review
- Templates checked: ✅ plan-template.md, ✅ spec-template.md, ✅ tasks-template.md
- No pending TODOs
-->

# DeepEnd Constitution

## Core Principles

### I. Specification-First Development

Every feature MUST begin with a complete specification before any implementation. Specifications MUST:
- Define clear user scenarios with acceptance criteria
- Be independently testable at the story level
- Include prioritized user journeys (P1, P2, P3...)
- Be approved by stakeholders before technical planning begins

**Rationale**: Specifications prevent scope creep, ensure shared understanding, and provide a contract for testing.

### II. Agent-Driven Workflow

Feature development MUST follow the agent orchestration pattern:
- Each phase has a dedicated agent with a single responsibility (specify → plan → tasks → implement)
- Agents MUST use handoffs to transition between phases
- Templates guide agent outputs for consistency
- User input via `$ARGUMENTS` is processed through the agent chain

**Rationale**: Structured agent workflow ensures repeatable processes, clear phase gates, and automated consistency checks.

### III. Template Consistency

All artifacts (specs, plans, tasks, checklists) MUST be generated from templates in `.specify/templates/`:
- Templates contain placeholder tokens in `[BRACKET_FORMAT]`
- Agents MUST replace all placeholders with concrete values
- No artifacts created outside the template system
- Template modifications MUST be documented in constitution amendments

**Rationale**: Templates enforce structural consistency, enable automation, and reduce cognitive load during feature development.

### IV. Version Control Integration

Feature development MUST be tracked through Git branching:
- Feature branches follow `[###-feature-name]` pattern with auto-incremented numbers
- Specs stored in `specs/[###-feature-name]/` directory structure
- Branch names and spec directories MUST stay synchronized
- Agents check for existing branches before creating new ones

**Rationale**: Git integration provides traceability, enables parallel development, and maintains historical context for features.

### V. Structured Documentation Hierarchy

Documentation MUST follow the prescribed directory structure:
- `.specify/memory/` - Project-level persistent state (constitution, etc.)
- `.specify/templates/` - Reusable artifact templates
- `.specify/scripts/` - Automation scripts for common operations
- `.github/agents/` - Agent definitions with handoff configurations
- `.github/prompts/` - Agent-specific prompt templates
- `specs/[###-feature-name]/` - Per-feature artifacts (plan, research, tasks, contracts)

**Rationale**: Consistent structure enables agent automation, improves discoverability, and scales as projects grow.

## Development Workflow Requirements

### Phase Gates

All features MUST progress through mandatory phase gates:

1. **Specification Gate**: User scenarios defined, prioritized, and approved
2. **Constitution Check Gate**: Technical plan validated against all principles before research begins
3. **Design Gate**: Data models, contracts, and quickstart guides completed
4. **Task Gate**: Dependency-ordered, actionable tasks generated with file paths
5. **Test Gate**: Tests written and reviewed before implementation begins (TDD)
6. **Implementation Gate**: Code written with all tests passing before merge

### Testing Standards

All features MUST follow Test-Driven Development (TDD):
- Tests MUST be written before implementation code
- Each user story MUST have comprehensive test coverage
- Tests MUST be independently executable and verifiable
- Test tasks MUST appear before implementation tasks in task breakdown
- Implementation MUST NOT begin until tests are reviewed and approved

**Rationale**: TDD ensures requirements are testable, catches design issues early, and provides living documentation of expected behavior.

### Compliance Standards

The project follows standard software development practices:
- Version control with meaningful commit messages
- Code review for all changes
- Documentation updated with code changes
- Security best practices for dependency management
- No special regulatory compliance requirements

### Artifact Dependencies

Agents MUST respect artifact dependencies:
- `plan.md` requires `spec.md` as input
- `tasks.md` requires completed Phase 1 design artifacts
- Implementation requires `tasks.md` with clear acceptance criteria
- All artifacts reference their input sources in frontmatter

### Quality Standards

All generated artifacts MUST:
- Include creation date and status tracking
- Reference source inputs explicitly
- Use consistent Markdown formatting
- Contain actionable, measurable criteria
- Be independently verifiable

## Governance

### Amendment Authority

Constitution amendments are governed by:
- **Authority**: Project maintainer(s) only
- **Process**: Formal review and approval required
- **Documentation**: All changes must include rationale and impact analysis
- **Transparency**: Amendment history tracked in Sync Impact Report

### Amendment Process

Constitution amendments MUST:
1. Be proposed by project maintainer(s) with detailed rationale
2. Undergo formal review process before adoption
3. Increment version following semantic versioning (MAJOR.MINOR.PATCH)
4. Update the Sync Impact Report with all affected artifacts
5. Propagate changes to dependent templates within the same commit
6. Update governance dates (`LAST_AMENDED_DATE`)

### Compliance Verification

All agent executions MUST:
- Verify outputs against constitutional principles
- Flag violations for user review before proceeding
- Document justifications for any exceptions
- Update templates when patterns emerge from exceptions

### Versioning Policy

Version increments follow semantic versioning:
- **MAJOR**: Backward-incompatible principle changes or removals
- **MINOR**: New principles added or existing principles expanded
- **PATCH**: Clarifications, typo fixes, non-semantic refinements

**Version**: 1.0.0 | **Ratified**: 2025-12-12 | **Last Amended**: 2025-12-12
