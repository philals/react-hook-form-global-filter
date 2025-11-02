/**
 * Global Input Filter - Generic JavaScript implementation
 * Intercepts key presses on input elements and filters out specified characters
 */

interface GlobalFilterOptions {
  filteredChars?: string[];
  alertMessage?: (char: string) => string;
  pasteAlertMessage?: (chars: string[]) => string;
  targetSelector?: string;
  eventType?: "keypress" | "keydown";
  enablePasteFiltering?: boolean;
}

/**
 * Global filter class for managing input filtering
 */
export class GlobalInputFilter {
  private filteredChars: string[];
  private alertMessage: (char: string) => string;
  private pasteAlertMessage: (chars: string[]) => string;
  private targetSelector: string;
  private eventType: "keypress" | "keydown";
  private enablePasteFiltering: boolean;
  private eventHandler: ((event: KeyboardEvent) => void) | null = null;
  private pasteHandler: ((event: ClipboardEvent) => void) | null = null;

  constructor(options: GlobalFilterOptions = {}) {
    this.filteredChars = options.filteredChars || ["@", "#"];
    this.alertMessage =
      options.alertMessage ||
      ((char: string) =>
        `The character "${char}" is not allowed in input fields.`);
    this.pasteAlertMessage =
      options.pasteAlertMessage ||
      ((chars: string[]) =>
        `The following characters are not allowed and were filtered out: ${chars.join(
          ", "
        )}`);
    this.targetSelector =
      options.targetSelector ||
      'input:not([type="submit"]):not([type="button"]):not([type="reset"])';
    this.eventType = options.eventType || "keypress";
    this.enablePasteFiltering = options.enablePasteFiltering !== false; // Default to true
  }

  /**
   * Initialize the global filter
   */
  init(): void {
    if (this.eventHandler || this.pasteHandler) {
      this.destroy(); // Clean up existing handlers
    }

    // Keyboard event handler
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

    // Paste event handler
    if (this.enablePasteFiltering) {
      this.pasteHandler = (event: ClipboardEvent) => {
        const target = event.target as HTMLElement;

        // Check if target matches our selector
        if (target.matches && target.matches(this.targetSelector)) {
          const clipboardData = event.clipboardData;
          if (clipboardData) {
            const pastedText = clipboardData.getData("text/plain");
            const filteredCharsFound = this.filteredChars.filter((char) =>
              pastedText.includes(char)
            );

            if (filteredCharsFound.length > 0) {
              event.preventDefault();

              // Filter the pasted text
              const filteredText = this.filterPastedText(pastedText);

              // Insert the filtered text
              const inputElement = target as HTMLInputElement;
              if (inputElement.setRangeText) {
                const start = inputElement.selectionStart || 0;
                const end = inputElement.selectionEnd || 0;
                inputElement.setRangeText(filteredText, start, end, "end");
              } else {
                // Fallback for older browsers
                inputElement.value = inputElement.value + filteredText;
              }

              // Dispatch input event to notify frameworks like React
              inputElement.dispatchEvent(new Event("input", { bubbles: true }));

              // Show alert about filtered characters
              alert(this.pasteAlertMessage(filteredCharsFound));
            }
          }
        }
      };

      document.addEventListener("paste", this.pasteHandler);
    }

    document.addEventListener(this.eventType, this.eventHandler);
  }

  /**
   * Filter pasted text by removing forbidden characters
   */
  private filterPastedText(text: string): string {
    const regex = new RegExp(
      `[${this.filteredChars
        .map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("")}]`,
      "g"
    );
    return text.replace(regex, "");
  }

  /**
   * Destroy the global filter and clean up event listeners
   */
  destroy(): void {
    if (this.eventHandler) {
      document.removeEventListener(this.eventType, this.eventHandler);
      this.eventHandler = null;
    }
    if (this.pasteHandler) {
      document.removeEventListener("paste", this.pasteHandler);
      this.pasteHandler = null;
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
    pasteAlertMessage: (chars: string[]) =>
      `The following characters were filtered out from your paste: ${chars.join(
        ", "
      )}`,
    eventType: "keypress",
    enablePasteFiltering: true,
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
 * // Basic usage with default settings (filters @ and # from typing and pasting)
 * const cleanup = initGlobalInputFilter();
 * // Later: cleanup();
 *
 * // Custom characters and messages for both typing and pasting
 * const cleanup = initGlobalInputFilter({
 *   filteredChars: ['$', '%', '&'],
 *   alertMessage: (char) => `Sorry, ${char} is not allowed!`,
 *   pasteAlertMessage: (chars) => `These chars were removed: ${chars.join(', ')}`,
 *   eventType: 'keydown',
 *   enablePasteFiltering: true
 * });
 *
 * // Class-based usage with paste filtering disabled
 * const filter = new GlobalInputFilter({
 *   filteredChars: ['<', '>', '"'],
 *   targetSelector: 'input[type="text"], textarea',
 *   enablePasteFiltering: false  // Only filter keyboard input
 * });
 * filter.init();
 * // Later: filter.destroy();
 *
 * // Vanilla JavaScript usage (no framework)
 * document.addEventListener('DOMContentLoaded', () => {
 *   const filter = createDefaultFilter();  // Includes paste filtering
 *   filter.init();
 * });
 */
