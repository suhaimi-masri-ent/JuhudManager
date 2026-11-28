function initializeCollapsiblePanels() {
    const toggleButtons = document.querySelectorAll("[data-panel-toggle]");

    toggleButtons.forEach(button => {
        const panelId = button.getAttribute("aria-controls");
        const panel = document.getElementById(panelId);
        const label = button.querySelector("[data-toggle-label]");

        if (!panel || !label) {
            return;
        }

        button.addEventListener("click", () => {
            const isExpanded =
                button.getAttribute("aria-expanded") === "true";

            const nextExpanded = !isExpanded;

            button.setAttribute(
                "aria-expanded",
                String(nextExpanded)
            );

            panel.hidden = !nextExpanded;

            label.textContent = nextExpanded
                ? "Collapse"
                : "Expand";
        });
    });
}

initializeCollapsiblePanels();
