// Generic versioned-JSON migration chain, shared by game saves and settings.
// migrations[n] turns a version-n object into a version-(n+1) object.

export class NewerVersionError extends Error {
  constructor(found, current) {
    super(`Data version ${found} is newer than this build (${current}).`);
    this.found = found;
  }
}

export function migrate(data, migrations, currentVersion) {
  let version = Number.isInteger(data.version) ? data.version : 0;
  if (version > currentVersion) throw new NewerVersionError(version, currentVersion);
  let result = structuredClone(data);
  while (version < currentVersion) {
    const step = migrations[version];
    if (!step) throw new Error(`No migration from version ${version}.`);
    result = step(result);
    version += 1;
    result.version = version;
  }
  return result;
}
