# Diagrams

Исходные/черновые архитектурные диаграммы к книге.

- `monitoring-arch.jsx` — старый React/JSX-компонент с интерактивной моделью операционных слоев мониторинга.
- `monitoring_flow.html` — исходная HTML/SVG-схема сквозного потока данных мониторинга.

Для публикации в MkDocs используются самодостаточные UTF-8 HTML-версии в `docs/diagrams/`:

- `docs/diagrams/monitoring_arch_layers.html` — операционная модель: инфраструктура, сбор, обработка, алертинг, реагирование, SLA, дашборды.
- `docs/diagrams/monitoring_flow.html` — целевая архитектура потока: источники, proxy, server, БД, обработка, каналы, реакция, incident lifecycle, postmortem.

Они встроены в главу 05 через `iframe`, чтобы не требовать React-сборки и не менять pipeline MkDocs.
