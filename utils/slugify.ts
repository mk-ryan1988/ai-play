export function generateSlug(projectName: string, releaseName: string): string {
  const baseSlug = `${projectName}-${releaseName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  return `${baseSlug}`;
}
