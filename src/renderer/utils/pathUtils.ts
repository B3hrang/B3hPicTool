/**
 * Converts a local file path to a URL.
 * Since webSecurity is disabled, we can use simple file:// URLs or direct paths if supported.
 */
export const toMediaUrl = (filePath: string): string => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;

    // Clean path separators
    const cleanPath = filePath.replace(/\\/g, '/');

    // With webSecurity: false, we can use file:// directly.
    return `file:///${cleanPath}`;
};
