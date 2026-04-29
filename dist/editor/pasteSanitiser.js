export function sanitisePaste(e) {
    e.preventDefault();
    // strip all HTML, keep plain text only
    return (e.clipboardData?.getData('text/plain') ?? '').replace(/\r\n/g, '\n');
}
