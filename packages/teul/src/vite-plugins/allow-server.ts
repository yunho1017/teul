import type { Plugin } from 'vite';
import * as swc from '@swc/core';

const transformExportedClientThings = (
  mod: swc.Module,
): Set<string> => {
  const exportNames = new Set<string>();

  // Collect export names
  for (const item of mod.body) {
    if (item.type === 'ExportDeclaration') {
      if (item.declaration.type === 'FunctionDeclaration') {
        exportNames.add(item.declaration.identifier.value);
      } else if (item.declaration.type === 'ClassDeclaration') {
        exportNames.add(item.declaration.identifier.value);
      } else if (item.declaration.type === 'VariableDeclaration') {
        for (const d of item.declaration.declarations) {
          if (d.id.type === 'Identifier') {
            exportNames.add(d.id.value);
          }
        }
      }
    } else if (item.type === 'ExportNamedDeclaration') {
      for (const s of item.specifiers) {
        if (s.type === 'ExportSpecifier') {
          exportNames.add(s.exported ? s.exported.value : s.orig.value);
        }
      }
    } else if (item.type === 'ExportDefaultExpression') {
      exportNames.add('default');
    } else if (item.type === 'ExportDefaultDeclaration') {
      exportNames.add('default');
    }
  }

  return exportNames;
};

function hasDirective(mod: swc.Module, directive: string): boolean {
  for (const item of mod.body) {
    if (item.type === 'ExpressionStatement') {
      if (
        item.expression.type === 'StringLiteral' &&
        item.expression.value === directive
      ) {
        return true;
      }
    }
  }
  return false;
}

/*
Apply dead code elimination to preserve only server-safe exports.

=== Example input ===

"use client"
import { useState } from 'react';

export const MyClientComp = () => {
  const [count, setCount] = useState(0);
  return <div>{count}</div>
}

=== Example output ===

"use client"
export const MyClientComp = () => { throw new Error('...') }
*/

export function allowServerPlugin(): Plugin {
  return {
    name: 'teul:allow-server',
    transform(code) {
      if (this.environment.name !== 'rsc') {
        return;
      }
      if (!code.includes('use client')) {
        return;
      }

      const mod = swc.parseSync(code, {
        syntax: 'typescript',
        tsx: true,
      });

      if (!hasDirective(mod, 'use client')) {
        return;
      }

      const exportNames = transformExportedClientThings(mod);

      // Remove all body items (keep only directive)
      mod.body = mod.body.filter(item =>
        item.type === 'ExpressionStatement' &&
        item.expression.type === 'StringLiteral' &&
        item.expression.value === 'use client'
      );

      let newCode = swc.printSync(mod).code;

      // Add stub exports that throw errors
      for (const name of exportNames) {
        const value = `() => { throw new Error('It is not possible to invoke a client function from the server: ${JSON.stringify(name)}') }`;
        newCode += `export ${name === 'default' ? name : `const ${name} =`} ${value};\n`;
      }

      return `"use client";\n` + newCode;
    },
  };
}
