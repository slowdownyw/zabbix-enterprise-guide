# Zabbix Enterprise Guide

![Zabbix](https://img.shields.io/badge/Zabbix-6.x%20%2F%207.x-red?style=flat-square)
![License](https://img.shields.io/badge/docs-CC%20BY--SA%204.0-blue?style=flat-square)
![Chapters](https://img.shields.io/badge/глав-15-orange?style=flat-square)
![Status](https://img.shields.io/badge/статус-в%20разработке-yellow?style=flat-square)

**Практическое руководство по мониторингу крупного предприятия** — 1С, Exchange, MSSQL, SCADA, сетевое оборудование.

Достался Zabbix "как есть" от предыдущей команды? Проектируете мониторинг для производства с КИИ с нуля? Команда тонет в alert fatigue и игнорирует алерты?

Эта книга — про **инженерию эксплуатации**: теги, severity как действие, runbook'и, SLA, разделение IT и OT, дашборды и эскалации. Не про установку по шагам (для этого есть [официальная документация](https://www.zabbix.com/documentation)).

📖 **[Читать онлайн → zabbix-enterprise-guide на GitHub Pages](https://slowdownyw.github.io/zabbix-enterprise-guide/)**

---

## Что внутри

| Главы | Тема |
|-------|------|
| 1–5 | Принципы: сервис vs хост, severity, теги и группы, LLD, многослойный дизайн |
| 6–8 | Архитектура: развёртывание, Proxy Groups, 90-day roadmap, GitOps |
| 9–11 | Runbooks, SLA, дашборды |
| 12–13, 15–16 | Шаблоны, антипаттерны, операционная рутина, playbook внедрения |

У каждой главы в шапке статус — от 🟢 *conceptually stable* до 🔴 *requirements only*.

В [`examples/`](./examples/) — tag schema, trigger patterns, UserParameters, RACI, decision log, ADR-примеры.

---

## Для кого

- **DevOps / системные инженеры** — получили Zabbix в наследство и хотят привести его в порядок
- **Архитекторы** — проектируют мониторинг для производственного предприятия с КИИ
- **Тимлиды** — переводят команду от "красных лампочек" к зрелой эксплуатации
- **Студенты и стажёры** — хотят понять, как устроен мониторинг в крупных компаниях

---

## Быстрый старт

```bash
pip install mkdocs-material
mkdocs serve
# открыть http://localhost:8000
```

---

## Как контрибьютить

PR приветствуются. Особенно ценны:

- **Перевалидация в проде** — запускали что-то из главы 13 и оно сработало (или нет)? Напишите в Issue
- **Реальные runbook'и** — в обезличенном виде
- **Опечатки и фактические ошибки** — без церемоний, через PR

При сабмите PR указывайте версию Zabbix (6.x / 7.x), на которой тестировали.

→ [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Лицензия

- **Документация** (`docs/`, `README.md`) — [CC BY-SA 4.0](./LICENSE)
- **Код** (`scripts/`, `examples/`) — MIT

---

> ⚠️ Книга — мнения и опыт, не индустриальный стандарт. Перед внедрением тестируйте и согласовывайте с ИБ. SCADA/КИИ — только в рамках 187-ФЗ и с профильными специалистами.