import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

// Load pure TypeScript modules with Node's built-in test runner.
export function loadTypeScript(file, overrides = {}) {
  const filename = path.resolve(file);
  const source = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const loaded = { exports: {} };
  const require = createRequire(filename);
  const localRequire = (specifier) => {
    if (Object.hasOwn(overrides, specifier)) return overrides[specifier];
    if (specifier.startsWith("@/"))
      return loadTypeScript(`src/${specifier.slice(2)}.ts`, overrides);
    if (specifier.startsWith("."))
      return loadTypeScript(
        path.resolve(path.dirname(filename), specifier + ".ts"),
        overrides,
      );
    return require(specifier);
  };
  new Function("require", "module", "exports", compiled)(
    localRequire,
    loaded,
    loaded.exports,
  );
  return loaded.exports;
}
