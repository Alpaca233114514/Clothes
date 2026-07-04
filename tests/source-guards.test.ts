import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SOURCE_DIRS = ["app", "components", "lib"];

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      return listSourceFiles(fullPath);
    }

    return /\.(ts|tsx)$/.test(entry) ? [fullPath] : [];
  });
}

describe("source guards", () => {
  it("keeps localStorage access centralized in lib/storage.ts", () => {
    const directStorageCall = /(?:window\.)?localStorage\./;
    const offenders = SOURCE_DIRS.flatMap((dir) => listSourceFiles(join(ROOT, dir)))
      .filter((file) => !relative(ROOT, file).replaceAll("\\", "/").endsWith("lib/storage.ts"))
      .filter((file) => directStorageCall.test(readFileSync(file, "utf8")))
      .map((file) => relative(ROOT, file));

    expect(offenders).toEqual([]);
  });

  it("keeps clearAllData narrow and avoids blanket localStorage.clear cheating", () => {
    const storageSource = readFileSync(join(ROOT, "lib", "storage.ts"), "utf8");

    expect(storageSource).not.toContain("localStorage.clear");
    expect(storageSource).toContain("removeItem");
  });
});
