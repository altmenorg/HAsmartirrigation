// Cache to track loading state and avoid duplicate loads
let isLoading = false;
let loadPromise: Promise<void> | null = null;

export const loadHaForm = async (): Promise<void> => {
  // Return cached promise if already loading
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Quick check if already loaded
  if (
    customElements.get("ha-checkbox") &&
    customElements.get("ha-slider") &&
    customElements.get("ha-panel-config")
  ) {
    return Promise.resolve();
  }

  // Set loading state and cache the promise
  isLoading = true;
  loadPromise = loadHaFormInternal();

  try {
    await loadPromise;
  } finally {
    isLoading = false;
    loadPromise = null;
  }
};

// Internal function that does the actual loading work
async function loadHaFormInternal(): Promise<void> {
  try {
    // Use requestIdleCallback to defer heavy operations when browser is idle
    await new Promise<void>((resolve) => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => resolve());
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => resolve(), 0);
      }
    });

    // Wait for partial-panel-resolver to be defined
    await customElements.whenDefined("partial-panel-resolver");

    // Batch DOM operations to reduce reflows
    const fragment = document.createDocumentFragment();
    const ppr = document.createElement("partial-panel-resolver") as any;
    fragment.appendChild(ppr);

    // Configure the resolver
    ppr.hass = {
      panels: [
        {
          url_path: "tmp",
          component_name: "config",
        },
      ],
    };

    // Use a microtask to allow other operations to proceed
    await new Promise<void>((resolve) => queueMicrotask(() => resolve()));

    ppr._updateRoutes();
    await ppr.routerOptions.routes.tmp.load();

    await customElements.whenDefined("ha-panel-config");

    // Another microtask to prevent blocking
    await new Promise<void>((resolve) => queueMicrotask(() => resolve()));

    const cpr = document.createElement("ha-panel-config") as any;
    fragment.appendChild(cpr);

    await cpr.routerOptions.routes.automation.load();

    // Clean up the fragment (elements were just used for loading, not for DOM)
    fragment.textContent = "";
  } catch (error) {
    console.error("Failed to load HA form elements:", error);
    // Don't throw - allow the application to continue functioning
  }
}

export const loadHaYamlEditor = async () => {
  if (customElements.get("ha-yaml-editor")) return;

  // Load in ha-yaml-editor from developer-tools-service
  const ppResolver = document.createElement("partial-panel-resolver");
  const routes = (ppResolver as any).getRoutes([
    {
      component_name: "developer-tools",
      url_path: "a",
    },
  ]);
  await routes?.routes?.a?.load?.();
  const devToolsRouter = document.createElement("developer-tools-router");
  await (devToolsRouter as any)?.routerOptions?.routes?.service?.load?.();
};

export const loadHaTabs = async (): Promise<void> => {
  // Tab components might already be available, just check and return
  console.log("Checking for tab components...");

  // Check what components are actually available
  console.log("ha-tab-group available:", !!customElements.get("ha-tab-group"));
  console.log(
    "ha-tab-group-tab available:",
    !!customElements.get("ha-tab-group-tab"),
  );

  // Let's try a timeout-based wait for the components
  let attempts = 0;
  const maxAttempts = 50; // 5 seconds max wait

  while (attempts < maxAttempts) {
    if (
      customElements.get("ha-tab-group") &&
      customElements.get("ha-tab-group-tab")
    ) {
      console.log("Tab components found after", attempts * 100, "ms");
      return Promise.resolve();
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  console.log("Tab components not found, continuing anyway...");
  return Promise.resolve();
};
