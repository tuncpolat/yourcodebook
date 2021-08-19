import * as esbuild from 'esbuild-wasm';

// custom (bundle) plugin for esbuild

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {

      // resolve root entry index.js
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
        return { path: 'index.js', namespace: 'a' }
      })

      // resolve for relative paths in module inside fetched packages (./ and ../)
      build.onResolve({ filter: /^\.+\// }, (args: any) => {
        return { path: new URL(args.path, "https://unpkg.com" + args.resolveDir + '/').href, namespace: 'a' }
      })

      // resolve for nested paths in module inside fetched packages (residual)
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          path: `https://unpkg.com/${args.path}`,
          namespace: 'a'
        }
      });
    },
  };
};
