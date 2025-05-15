export const DATA = [
  {
    path: "whats-new",
    title: "What's New in Vyper 0.4",
    parents: [],
  },
  {
    path: "hello-world",
    title: "Hello World",
    parents: [],
  },
  { path: "values", title: "Data Types - Values", parents: ["hello-world"] },
  {
    path: "references",
    title: "Data Types - References",
    parents: ["hello-world"],
  },
  {
    path: "dynamic-arrays",
    title: "Dynamic Arrays",
    parents: ["values"],
  },
  {
    path: "constructor",
    title: "Constructor",
    parents: ["function"],
  },
  {
    path: "private-public-state-variables",
    title: "Private and Public State Variables",
    parents: ["hello-world"],
  },
  {
    path: "constants",
    title: "Constants",
    parents: ["values"],
  },
  {
    path: "immutable",
    title: "Immutable",
    parents: ["constants", "constructor"],
  },
  { path: "function", title: "Function", parents: ["hello-world"] },
  {
    path: "internal-external-functions",
    title: "Internal and External Functions",
    parents: ["function"],
  },
  {
    path: "view-pure-functions",
    title: "View and Pure Functions",
    parents: ["function"],
  },
  {
    path: "if-else",
    title: "If Else",
    parents: ["hello-world"],
  },
  { path: "for-loop", title: "For Loop", parents: ["hello-world"] },
  { path: "error", title: "Error", parents: ["hello-world"] },
  { path: "event", title: "Event", parents: ["hello-world"] },
  { path: "payable", title: "Payable", parents: ["function"] },
  {
    path: "default-function",
    title: "Default Function",
    parents: ["send-ether"],
  },
  {
    path: "send-ether",
    title: "Send Ether",
    parents: ["payable"],
  },
  { path: "interface", title: "Interface", parents: ["function"] },
  { path: "raw-call", title: "Raw Call", parents: ["interface"] },
  { path: "delegate-call", title: "Delegate Call", parents: ["raw-call"] },
  { path: "hash-function", title: "Hash Function", parents: ["function"] },
  {
    path: "verify-signature",
    title: "Verify Signature",
    parents: ["hash-function"],
  },
  {
    path: "re-entrancy-lock",
    title: "Re-entrancy Lock",
    parents: ["function"],
  },
  {
    path: "create-new-contract",
    title: "Create New Contract",
    parents: ["constructor"],
  },
  { path: "self-destruct", title: "Self Destruct", parents: ["function"] },
  { path: "imports", title: "Imports", parents: ["hello-world"] },
  { path: "modules", title: "Modules", parents: ["imports"] },
  { path: "unsafe-math", title: "Unsafe Math", parents: ["function"] },
  { path: "print", title: "Debug with Print", parents: ["hello-world"] },
  // app
  {
    path: "app/rebase-token",
    title: "Rebase Token",
    parents: ["function"],
  },
  {
    path: "app/lerp",
    title: "Linear Interpolation",
    parents: ["function"],
  },
  {
    path: "app/multi-sig-wallet",
    title: "Multi Sig Wallet",
    parents: ["raw-call"],
  },
  // defi
  {
    path: "defi/curve-swap",
    title: "Curve Swap",
    parents: ["interface"],
  },
  {
    path: "defi/curve-liquidity",
    title: "Curve Add and Remove Liquidity",
    parents: ["interface"],
  },
]
