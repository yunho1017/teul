import type { Plugin } from "vite";

export function defaultAdapterPlugin({
  adapter: adapterName,
}: {
  adapter: string;
}): Plugin {
  const adapterModule = "teul/adapters/default";
  return {
    name: "teul:vite-plugins:default-adapter",
    enforce: "pre",
    async resolveId(source, _importer, options) {
      if (source === adapterModule) {
        const resolved = await this.resolve(adapterName, undefined, {
          ...options,
          skipSelf: true,
        });
        if (!resolved) {
          return this.error(
            `Failed to resolve adapter package: ${adapterName}`,
          );
        }
        return resolved;
      }
    },
  };
}
