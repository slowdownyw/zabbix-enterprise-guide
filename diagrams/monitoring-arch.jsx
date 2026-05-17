import { useState } from "react";

const layers = [
  {
    id: "infra",
    label: "01 / ИНФРАСТРУКТУРА",
    subtitle: "Что мониторим",
    color: "#4a9eff",
    items: [
      { name: "Серверы (Windows/Linux)", detail: "CPU, RAM, Disk, Processes" },
      { name: "Сеть (Cisco/Eltex)", detail: "Интерфейсы, VLAN, DHCP-пулы" },
      { name: "Виртуализация (VMware/KVM)", detail: "Хосты, датасторы, кластеры" },
      { name: "БД (MSSQL/Postgres)", detail: "Locks, connections, WAL lag" },
      { name: "1С / Приложения", detail: "Сессии, фоновые задания, очереди" },
      { name: "SCADA (MasterScada4D)", detail: "OPC-теги, статус контроллеров" },
      { name: "ИБ (UserGate, AD)", detail: "Авторизации, политики, события" },
    ],
  },
  {
    id: "collect",
    label: "02 / СБОР ДАННЫХ",
    subtitle: "Как собираем",
    color: "#a78bfa",
    items: [
      { name: "Zabbix Agent 2", detail: "Активный / пассивный режим" },
      { name: "SNMP v2c / v3", detail: "Сетевое оборудование, UPS" },
      { name: "JMX / ODBC", detail: "Java-приложения, базы данных" },
      { name: "HTTP-checks", detail: "Эндпойнты, REST API, веб-формы" },
      { name: "IPMI / iLO / iDRAC", detail: "Железо: температуры, питание" },
      { name: "Log-файлы (logrt)", detail: "Приложения, события Windows/Linux" },
    ],
  },
  {
    id: "process",
    label: "03 / ОБРАБОТКА СОБЫТИЙ",
    subtitle: "Event processing",
    color: "#f59e0b",
    items: [
      { name: "Фильтрация шума", detail: "Убираем informational-события" },
      { name: "Корреляция", detail: "Группируем связанные алерты" },
      { name: "Severity-маппинг", detail: "Info → Warning → High → Disaster" },
      { name: "Maintenance windows", detail: "Подавление во время плановых работ" },
      { name: "Зависимости хостов", detail: "Не орать если свитч лёг" },
      { name: "Trending / прогноз", detail: "Предсказание исчерпания ресурсов" },
    ],
  },
  {
    id: "alert",
    label: "04 / АЛЕРТИНГ",
    subtitle: "Кто, куда, когда",
    color: "#f87171",
    items: [
      { name: "Telegram / Signal", detail: "Дежурный — мгновенно" },
      { name: "Email", detail: "Тимлид — Warning+ по расписанию" },
      { name: "SMS / звонок", detail: "Disaster — эскалация если нет ответа" },
      { name: "ITSM-тикет (авто)", detail: "Создание инцидента в Service Desk" },
      { name: "Матрица эскалации", detail: "L1 → L2 → L3 → Руководство" },
    ],
  },
  {
    id: "response",
    label: "05 / РЕАГИРОВАНИЕ",
    subtitle: "Runbooks & процессы",
    color: "#34d399",
    items: [
      { name: "Runbook в триггере", detail: "Ссылка прямо в теле алерта → вики" },
      { name: "Диагностические шаги", detail: "Что проверить, какие команды" },
      { name: "Контакты", detail: "Кому звонить, чей сервис, чья ответственность" },
      { name: "Known errors", detail: "База известных проблем и воркараундов" },
      { name: "Change Management", detail: "Изменения только через RFC, не в бой" },
      { name: "Post-mortem", detail: "После каждого Major Incident — разбор" },
    ],
  },
  {
    id: "sla",
    label: "06 / SLA & ОТЧЁТНОСТЬ",
    subtitle: "Что измеряем",
    color: "#fb923c",
    items: [
      { name: "Internal SLA по сервисам", detail: "99.5% доступность 1С в рабочее время" },
      { name: "MTTR / MTBF", detail: "Среднее время восстановления / между сбоями" },
      { name: "Top-5 инцидентов", detail: "Что чаще всего ломается → Problem Mgmt" },
      { name: "Capacity trends", detail: "Через 3 месяца закончится диск на srv-db-01" },
      { name: "Weekly / Monthly отчёт", detail: "IT-менеджер → руководство" },
    ],
  },
  {
    id: "dash",
    label: "07 / ДАШБОРДЫ",
    subtitle: "Три аудитории",
    color: "#22d3ee",
    items: [
      { name: "NOC / Дежурный", detail: "Все активные проблемы, метрики реального времени" },
      { name: "IT-менеджер", detail: "Тренды, SLA, топ проблем за период" },
      { name: "Руководство", detail: "Светофоры по сервисам, без технических деталей" },
    ],
  },
];

const flows = [
  "Сбой на сервере → Zabbix Agent → триггер Disaster",
  "Триггер → Telegram дежурному + авто-тикет в ServiceDesk",
  "Дежурный открывает тикет → видит ссылку на Runbook",
  "Runbook: проверить X, перезапустить Y, позвонить Z",
  "Инцидент закрыт → время восстановления → в SLA-метрику",
  "5 одинаковых инцидентов за месяц → Problem Management",
];

export default function MonitoringArch() {
  const [active, setActive] = useState(null);
  const [flowStep, setFlowStep] = useState(null);

  const activeLayer = layers.find((l) => l.id === active);

  return (
    <div style={{
      background: "#0a0e1a",
      minHeight: "100vh",
      fontFamily: "'Courier New', 'Lucida Console', monospace",
      color: "#c9d1e0",
      padding: "24px",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32, borderBottom: "1px solid #1e2d40", paddingBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#4a9eff", letterSpacing: 4, marginBottom: 6 }}>
          OPERATIONAL MONITORING FRAMEWORK // ENTERPRISE
        </div>
        <div style={{ fontSize: 22, fontWeight: "bold", color: "#e2e8f0", letterSpacing: 1 }}>
          Архитектура мониторинга
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
          Нажми на слой — раскроется состав. Снизу — пример сквозного потока.
        </div>
      </div>

      {/* Layers grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 8,
        marginBottom: 24,
      }}>
        {layers.map((layer) => (
          <div
            key={layer.id}
            onClick={() => setActive(active === layer.id ? null : layer.id)}
            style={{
              border: `1px solid ${active === layer.id ? layer.color : "#1e2d40"}`,
              background: active === layer.id ? `${layer.color}12` : "#0d1426",
              borderRadius: 6,
              padding: "14px 16px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: 0, width: "3px",
              height: "100%", background: layer.color, opacity: active === layer.id ? 1 : 0.3,
            }} />
            <div style={{ fontSize: 10, color: layer.color, letterSpacing: 2, marginBottom: 4 }}>
              {layer.label}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>
              {layer.subtitle}
            </div>
            <div style={{ fontSize: 10, color: "#334155", marginTop: 8 }}>
              {layer.items.length} компонентов →
            </div>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {activeLayer && (
        <div style={{
          border: `1px solid ${activeLayer.color}40`,
          background: "#0d1426",
          borderRadius: 6,
          padding: 20,
          marginBottom: 24,
          animation: "fadeIn 0.15s ease",
        }}>
          <div style={{ fontSize: 11, color: activeLayer.color, letterSpacing: 3, marginBottom: 16 }}>
            {activeLayer.label} // ДЕТАЛИЗАЦИЯ
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 8,
          }}>
            {activeLayer.items.map((item, i) => (
              <div key={i} style={{
                display: "flex",
                gap: 12,
                padding: "10px 12px",
                background: "#111827",
                borderRadius: 4,
                border: "1px solid #1e2d40",
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: activeLayer.color,
                  marginTop: 5, flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 2 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incident flow */}
      <div style={{
        border: "1px solid #1e2d40",
        borderRadius: 6,
        padding: 20,
        marginBottom: 24,
        background: "#0d1426",
      }}>
        <div style={{ fontSize: 11, color: "#f59e0b", letterSpacing: 3, marginBottom: 16 }}>
          INCIDENT FLOW // ПРИМЕР СКВОЗНОГО ПОТОКА
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {flows.map((step, i) => (
            <div
              key={i}
              onClick={() => setFlowStep(flowStep === i ? null : i)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "10px 14px",
                background: flowStep === i ? "#1a1f2e" : "transparent",
                border: `1px solid ${flowStep === i ? "#f59e0b40" : "#1e2d40"}`,
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 0.1s ease",
              }}
            >
              <div style={{
                fontSize: 10,
                color: "#f59e0b",
                fontWeight: "bold",
                minWidth: 22,
                paddingTop: 1,
              }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ fontSize: 12, color: flowStep === i ? "#e2e8f0" : "#94a3b8", lineHeight: 1.5 }}>
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What breaks without each layer */}
      <div style={{
        border: "1px solid #1e2d40",
        borderRadius: 6,
        padding: 20,
        background: "#0d1426",
      }}>
        <div style={{ fontSize: 11, color: "#f87171", letterSpacing: 3, marginBottom: 16 }}>
          ЧТО ЛОМАЕТСЯ БЕЗ КАЖДОГО СЛОЯ
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 8,
        }}>
          {[
            { without: "Без runbooks", breaks: "Дежурный решает по памяти. Уволился — знания ушли." },
            { without: "Без SLA", breaks: "Светофор зелёный, но что значит «зелёный» — никто не знает." },
            { without: "Без матрицы эскалации", breaks: "Алерт улетел в Telegram, никто не взял. Инцидент висит 4 часа." },
            { without: "Без корреляции", breaks: "Упал свитч → 40 алертов. Alert fatigue. Дежурный игнорирует всё." },
            { without: "Без maintenance windows", breaks: "Ночное обслуживание → шторм алертов → ложные инциденты." },
            { without: "Без problem management", breaks: "Одно и то же чинят каждую неделю. Причина не ищется никогда." },
          ].map((r, i) => (
            <div key={i} style={{
              padding: "10px 14px",
              background: "#111827",
              borderRadius: 4,
              border: "1px solid #1e2d40",
            }}>
              <div style={{ fontSize: 12, color: "#f87171", marginBottom: 4, fontWeight: "bold" }}>
                ✗ {r.without}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{r.breaks}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
