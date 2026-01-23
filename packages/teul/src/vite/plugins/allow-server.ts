/**
 * Allow Server 플러그인
 *
 * "use client" 지시어가 있는 클라이언트 컴포넌트를 서버 환경(RSC)에서 안전하게 처리하는 플러그인입니다.
 *
 * 동작 방식:
 * 1. "use client" 파일을 감지
 * 2. 파일 내용을 제거하고 export만 유지
 * 3. 각 export를 에러를 던지는 스텁(stub) 함수로 대체
 *
 * 이를 통해 서버에서 클라이언트 컴포넌트를 실수로 실행하는 것을 방지하고,
 * 명확한 에러 메시지를 제공합니다.
 *
 * @example
 * // Input (client component):
 * "use client"
 * export const Button = () => <button>Click</button>
 *
 * // Output (server-safe stub):
 * "use client"
 * export const Button = () => { throw new Error('Cannot invoke client function from server') }
 */

import type { Plugin } from "vite";
import * as swc from "@swc/core";

const transformExportedClientThings = (mod: swc.Module): Set<string> => {
  const exportNames = new Set<string>();

  // Collect export names
  for (const item of mod.body) {
    if (item.type === "ExportDeclaration") {
      if (item.declaration.type === "FunctionDeclaration") {
        exportNames.add(item.declaration.identifier.value);
      } else if (item.declaration.type === "ClassDeclaration") {
        exportNames.add(item.declaration.identifier.value);
      } else if (item.declaration.type === "VariableDeclaration") {
        for (const d of item.declaration.declarations) {
          if (d.id.type === "Identifier") {
            exportNames.add(d.id.value);
          }
        }
      }
    } else if (item.type === "ExportNamedDeclaration") {
      for (const s of item.specifiers) {
        if (s.type === "ExportSpecifier") {
          exportNames.add(s.exported ? s.exported.value : s.orig.value);
        }
      }
    } else if (item.type === "ExportDefaultExpression") {
      exportNames.add("default");
    } else if (item.type === "ExportDefaultDeclaration") {
      exportNames.add("default");
    }
  }

  return exportNames;
};

function hasDirective(mod: swc.Module, directive: string): boolean {
  for (const item of mod.body) {
    if (item.type === "ExpressionStatement") {
      if (
        item.expression.type === "StringLiteral" &&
        item.expression.value === directive
      ) {
        return true;
      }
    }
  }
  return false;
}

export function allowServerPlugin(): Plugin {
  return {
    name: "teul:allow-server",
    transform(code) {
      if (this.environment.name !== "rsc") {
        return;
      }
      if (!code.includes("use client")) {
        return;
      }

      const mod = swc.parseSync(code, {
        syntax: "typescript",
        tsx: true,
      });

      if (!hasDirective(mod, "use client")) {
        return;
      }

      const exportNames = transformExportedClientThings(mod);

      // Remove all body items (keep only directive)
      mod.body = mod.body.filter(
        (item) =>
          item.type === "ExpressionStatement" &&
          item.expression.type === "StringLiteral" &&
          item.expression.value === "use client",
      );

      let newCode = swc.printSync(mod).code;

      // Add stub exports that throw errors
      for (const name of exportNames) {
        const value = `() => { throw new Error('It is not possible to invoke a client function from the server: ${JSON.stringify(name)}') }`;
        newCode += `export ${name === "default" ? name : `const ${name} =`} ${value};\n`;
      }

      return `"use client";\n` + newCode;
    },
  };
}
