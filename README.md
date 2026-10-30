# Kirby Operations Hub

Demonstration console for the India Global IT Hub: Service Desk, NOC, SOC and cloud operations.

- 26 screens, plus Live Demos as the last menu item
- 10 live demos on OpsRamp, Sentinel, Defender and ServiceNow
- **Microsoft Copilot Studio is the AI and action layer.** Seven agents (Service Desk, NOC, SOC, Change, Knowledge, FinOps, Major incident) summarise, route, enrich and act through connectors. Every action has a control tier: Act, Act and notify, or Stage for approval. See the Copilot Studio Agents screen, and the Copilot Studio tab inside every demo.
- **Drill down from anywhere.** Click any table row, chart bar, bubble, treemap block or site to open a detail panel with:
  - a root-cause path you can click step by step
  - a Copilot Studio summary
  - next actions that run, or wait for approval
  - a forecast with a preventive change
- **Predict and prevent on every screen.** Each screen ends with live vital signs (heartbeats), gauges, creative views (radar, treemap, flow, waterfall, calendar heat, bubble risk map, 24-hour clock, accelerometer) and a predict-and-prevent panel.

Plain HTML, CSS and JavaScript with no build step and no dependencies. To publish, turn on GitHub Pages from the `main` branch root.

| File | What it holds |
| --- | --- |
| `assets/hub.js`, `assets/hub.css` | Core console, screens and live demos |
| `assets/kx-core.js` | Copilot Studio agents and actions, drill-down panel, root cause, predict and prevent, insight strip |
| `assets/kx-viz.js` | Visual library: heartbeat, needle gauge, accelerometer, rings, radar, treemap, flow, waterfall, calendar, bubbles, forecast |
| `assets/kx-screens.js` | Copilot Studio Agents screen and the deeper section on every screen |
| `assets/enrich.css` | Styles for the above |

Sample data. Not connected to any live tool. Actions in the console are simulated and change nothing.
