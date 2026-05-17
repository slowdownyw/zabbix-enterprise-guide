# Contributing

Contributions are welcome, especially corrections, validated examples, and production lessons learned.

## What this project accepts

Good contributions:

- factual corrections with sources;
- validated Zabbix trigger expressions;
- sanitized UserParameter examples;
- LLD JSON examples;
- runbook patterns;
- dashboard/reporting patterns;
- clarifications and typo fixes.

Not accepted:

- secrets, tokens, passwords, private URLs, or real customer identifiers;
- screenshots with internal hostnames/IPs unless sanitized;
- vendor marketing copy;
- import-ready templates presented as production-safe without validation notes.

## Validation status

Use the same status language as the book:

| Status | Meaning |
|---|---|
| 🟢 Conceptually stable | Design idea is stable and generally applicable |
| 🟡 Design draft | Pattern is plausible but requires validation |
| 🔴 Requirements only | Monitoring requirement, not implementation |
| ⚫ Lab-tested | Tested in a lab; include Zabbix version and environment |
| 🟣 Production-tested | Tested in production; include context and limitations |

When submitting examples, state the validation status explicitly.

## Pull request checklist

Before opening a PR:

- [ ] `mkdocs build --strict` passes locally;
- [ ] no secrets or internal identifiers are included;
- [ ] examples state Zabbix version and validation status;
- [ ] trigger expressions use the modern `/host/key` syntax where applicable;
- [ ] new recommendations include rationale and limitations;
- [ ] links point to stable official documentation when possible.

## Style

- Write clearly and operationally.
- Prefer tables/checklists for procedures.
- Separate concept, requirement, and implementation.
- Do not mark anything as production-tested without context.
- Use `example.local`, `example.com`, and RFC 5737 documentation IP ranges (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`) for examples.

## Security and sanitization

Before sharing artifacts:

- rotate any token that might have been exposed;
- remove API keys, bearer tokens, passwords, cookies, session IDs;
- remove real customer names and personal data;
- replace internal domains with `example.local` or `example.com`;
- replace IP addresses with documentation ranges unless the network is intentionally public.

## Issues

Use issue templates:

- **Factual error** — incorrect or outdated statement;
- **Template validation result** — lab/prod result for triggers, UserParameters, or LLD;
- **Documentation improvement** — clarity, structure, missing topic.
