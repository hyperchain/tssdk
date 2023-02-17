type Env = "browser" | "node";

export function env(): Env {
  if (typeof XMLHttpRequest !== "undefined") {
    return "browser";
  }
  return "node";
}

export function isInBrowser() {
  return env() === "browser";
}

export function isInNode() {
  return env() === "node";
}
