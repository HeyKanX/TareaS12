import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";
import exec from "k6/execution";

const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:3000";
const endpoints = ["/api/student", "/api/courses", "/api/messages"];
const scenarioMetrics = Object.fromEntries([
  "carga_normal", "carga_elevada", "estres_progresivo",
].map((name) => [name, {
  duration: new Trend(`${name}_req_duration`, true),
  requests: new Counter(`${name}_requests`),
  errors: new Rate(`${name}_error_rate`),
}]));

export const options = {
  scenarios: {
    carga_normal: {
      executor: "constant-vus", vus: 10, duration: "2m", startTime: "0s", exec: "default",
    },
    carga_elevada: {
      executor: "constant-vus", vus: 30, duration: "3m", startTime: "2m", exec: "default",
    },
    estres_progresivo: {
      executor: "ramping-vus",
      startTime: "5m",
      stages: [
        { duration: "1m", target: 25 },
        { duration: "1m", target: 50 },
        { duration: "1m", target: 100 },
        { duration: "1m", target: 0 },
      ],
      exec: "default",
    },
  },
  thresholds: {
    "http_req_duration{scenario:carga_normal}": ["p(95)<500", "p(99)<1000"],
    "http_req_failed{scenario:carga_normal}": ["rate<0.01"],
    "checks{scenario:carga_normal}": ["rate>0.99"],
  },
};

export default function () {
  const endpoint = endpoints[(__VU + __ITER - 1) % endpoints.length];
  const response = http.get(`${baseUrl}${endpoint}`);
  const scenario = exec.scenario.name;
  scenarioMetrics[scenario].duration.add(response.timings.duration);
  scenarioMetrics[scenario].requests.add(1);
  scenarioMetrics[scenario].errors.add(response.status < 200 || response.status >= 400);
  let data;
  try {
    data = response.json();
  } catch {
    data = null;
  }
  check(response, {
    "endpoint responde HTTP 200": result => result.status === 200,
    "respuesta JSON tiene la estructura esperada": () => {
      if (!data || typeof data !== "object") return false;
      if (endpoint === "/api/student") return Boolean(data.student?.code);
      if (endpoint === "/api/courses") return Array.isArray(data.courses) && data.courses.length === 4;
      return Array.isArray(data.messages);
    },
  });
  sleep(1);
}
