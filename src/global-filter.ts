/**
 * Global Input Filter - Generic JavaScript implementation
 * Intercepts key presses on input elements and filters out specified characters
 */

interface GlobalFilterOptions {
  filteredChars?: string[];
  alertMessage?: (char: string) => string;
  targetSelector?: string;
  eventType?: "keypress" | "keydown";
}

/**
 * Global filter class for managing input filtering
 */
export class GlobalInputFilter {
  private filteredChars: string[];
  private alertMessage: (char: string) => string;
  private targetSelector: string;
  private eventType: "keypress" | "keydown";
  private eventHandler: ((event: KeyboardEvent) => void) | null = null;

  constructor(options: GlobalFilterOptions = {}) {
    this.filteredChars = options.filteredChars || ["@", "#"];
    this.alertMessage =
      options.alertMessage ||
      ((char: string) =>
        `The character "${char}" is not allowed in input fields.`);
    this.targetSelector =
      options.targetSelector ||
      'input:not([type="submit"]):not([type="button"]):not([type="reset"])';
    this.eventType = options.eventType || "keypress";
  }

  /**
   * Initialize the global filter
   */
  init(): void {
    if (this.eventHandler) {
      this.destroy(); // Clean up existing handler
    }

    this.eventHandler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      // Check if target matches our selector
      if (target.matches && target.matches(this.targetSelector)) {
        const key = event.key;

        // Check if the pressed key is in our filtered characters
        if (this.filteredChars.includes(key)) {
          event.preventDefault();
          alert(this.alertMessage(key));
        }
      }
    };

    document.addEventListener(this.eventType, this.eventHandler);
  }

  /**
   * Destroy the global filter and clean up event listeners
   */
  destroy(): void {
    if (this.eventHandler) {
      document.removeEventListener(this.eventType, this.eventHandler);
      this.eventHandler = null;
    }
  }

  /**
   * Update filtered characters
   */
  setFilteredChars(chars: string[]): void {
    this.filteredChars = chars;
  }

  /**
   * Get current filtered characters
   */
  getFilteredChars(): string[] {
    return [...this.filteredChars];
  }
}

/**
 * Simple function-based implementation for quick setup
 */
export const initGlobalInputFilter = (
  options: GlobalFilterOptions = {}
): (() => void) => {
  const filter = new GlobalInputFilter(options);
  filter.init();

  // Return cleanup function
  return () => filter.destroy();
};

/**
 * Default filter instance for @ and # symbols
 */
export const createDefaultFilter = (): GlobalInputFilter => {
  return new GlobalInputFilter({
    filteredChars: ["@", "#"],
    alertMessage: (char: string) =>
      `The character "${char}" is not allowed in input fields.`,
    eventType: "keypress",
  });
};

/**
 * Utility function to filter string values
 * Can be used for validation or cleanup
 */
export const filterInput = (
  value: string,
  filteredChars: string[] = ["@", "#"]
): string => {
  const regex = new RegExp(
    `[${filteredChars
      .map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("")}]`,
    "g"
  );
  const filteredValue = value.replace(regex, "");

  // Show alert if characters were filtered
  if (value.length !== filteredValue.length) {
    const chars = filteredChars.join(" and ");
    alert(`<LuiModal>The characters ${chars} are filtered out.</LuiModal>`);
  }

  return filteredValue;
};

/**
 * Usage Examples:
 *
 * // Basic usage with default settings (filters @ and #)
 * const cleanup = initGlobalInputFilter();
 * // Later: cleanup();
 *
 * // Custom characters and message
 * const cleanup = initGlobalInputFilter({
 *   filteredChars: ['$', '%', '&'],
 *   alertMessage: (char) => `Sorry, ${char} is not allowed!`,
 *   eventType: 'keydown'
 * });
 *
 * // Class-based usage
 * const filter = new GlobalInputFilter({
 *   filteredChars: ['<', '>', '"'],
 *   targetSelector: 'input[type="text"], textarea'
 * });
 * filter.init();
 * // Later: filter.destroy();
 *
 * // Vanilla JavaScript usage (no framework)
 * document.addEventListener('DOMContentLoaded', () => {
 *   const filter = createDefaultFilter();
 *   filter.init();
 * });
 */
