/**
 * Includes HTML content into specified elements by fetching the content from URLs.
 * @param {string} menu - The selected menu or page identifier.
 * @returns {Promise<void>} - A Promise that resolves when HTML content is included.
 */
async function includeHTML(menu) {
  let includeElements = document.querySelectorAll("[w3-include-html]");
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    
    /**
     * The URL to fetch HTML content from.
     * @type {string}
     */
    file = element.getAttribute("w3-include-html");

    /**
     * Fetches the HTML content from the specified URL.
     * @type {Response}
     */
    let resp = await fetch(file);
    if (resp.ok) {
      element.innerHTML = await resp.text();
    } else {
      element.innerHTML = "Page not found";
    }
  }

   /**
   * Highlights the selected menu or page.
   * @param {string} menu - The selected menu or page identifier.
   */
  selectedMenu(menu);
}
