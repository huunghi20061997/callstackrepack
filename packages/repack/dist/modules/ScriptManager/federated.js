import { ScriptManager } from './ScriptManager';
/**
 * Namespace for runtime utilities for Module Federation.
 */
export let Federated;
(function (_Federated) {
  /**
   * Resolves URL to a container or a chunk when using Module Federation,
   * based on given `scriptId` and `caller`.
   */

  /**
   * Configuration options for {@link createURLResolver} for Module Federation.
   * Allows to configure how created {@link URLResolver} will behave.
   */

  /**
   * Creates URL resolver for Module Federation from provided config.
   *
   * @example
   * ```ts
   * import { ScriptManager, Script, Federated } from '@callstack/repack/client';
   *
   * const resolveURL = Federated.createURLResolver({
   *   containers: {
   *     app1: 'http://localhost:9001/[name][ext]',
   *     app2: 'http://localhost:9002/[name].container.js',
   *   },
   *   chunks: {
   *     app2: 'http://localhost:9002/chunks/[name][ext]',
   *   },
   * });
   *
   * ScriptManager.shared.addResolver(async (scriptId, caller) => {
   *   let url;
   *   if (caller === 'main') {
   *     url = __DEV__
   *       ? Script.getDevServerURL(scriptId)
   *       : Script.getRemoteURL(`http://localhost:9000/${scriptId}`);
   *   } else {
   *     url = resolveURL(scriptId, caller);
   *   }
   *
   *   if (!url) {
   *     return undefined;
   *   }
   *
   *   return {
   *     url,
   *     query: {
   *       platform: Platform.OS,
   *     },
   *   };
   * });
   * ```
   *
   * `createURLResolver` is a abstraction over {@link Script.getRemoteURL},
   * for example:
   * ```ts
   * import { ScriptManager, Federated } from '@callstack/repack/client';
   *
   * ScriptManager.shared.addResolver((scriptId, caller) => {
   *   const resolveURL = Federated.createURLResolver({
   *     containers: {
   *       app1: 'http://localhost:9000/[name][ext]',
   *     },
   *   });
   *
   *   return {
   *     url: resolveURL(scriptId, caller);
   *   };
   * });
   * ```
   * is equivalent to:
   * ```ts
   * import { ScriptManager, Script } from '@callstack/repack/client';
   *
   * ScriptManager.shared.addResolver(async (scriptId, caller) => {
   *   if (scriptId === 'app1') {
   *     return {
   *       url: 'http://localhost:9000/app1.container.bundle',
   *     };
   *   }
   *
   *   if (caller === 'app1') {
   *     return {
   *       url: Script.getRemoteURL(`http://localhost:9000/${scriptId}`),
   *     };
   *   }
   * });
   * ```
   *
   * @param config Configuration for the resolver.
   * @returns A resolver function which will try to resolve URL based on given `scriptId` and `caller`.
   */
  function createURLResolver(config) {
    const resolvers = {};
    for (const key in config.containers) {
      resolvers[key] = (scriptId, caller) => {
        if (scriptId === key) {
          const url = config.containers[key].replace(/\[name\]/g, scriptId).replace(/\[ext\]/g, '.container.bundle');
          return url;
        }
        if (caller === key) {
          const url = (config.chunks?.[key] ?? config.containers[key]).replace(/\[name\]/g, scriptId);
          if (url.includes('[ext]')) {
            return webpackContext => webpackContext.u(url.replace(/\[ext\]/g, ''));
          }
          return url;
        }
        return undefined;
      };
    }
    return (scriptId, caller) => {
      const resolver = (caller ? resolvers[caller] : undefined) ?? resolvers[scriptId];
      return resolver(scriptId, caller);
    };
  }
  _Federated.createURLResolver = createURLResolver;
  /**
   * Dynamically imports module from a Module Federation container. Similar to `import('file')`, but
   * specific to Module Federation. Calling `importModule` will create an async boundary.
   *
   * Container will be evaluated only once. If you use `importModule` for the same container twice,
   * the container will be loaded and evaluated only on the first import.
   *
   * Under the hood, `importModule` will call `ScriptManager.shared.loadScript(containerName)`.
   * This means, a resolver must be added with `ScriptManager.shared.addResolver(...)` beforehand and provided proper
   * resolution logic to resolve URL based on the `containerName`.
   *
   * @param containerName Name of the container - should be the same name provided to
   * `webpack.container.ModuleFederationPlugin` in `library.name`.
   * @param module Full name with extension of the module to import from the container - only modules
   * exposed in `exposes` in `webpack.container.ModuleFederationPlugin` can be used.
   * @param scope Optional, scope for sharing modules between containers. Defaults to `'default'`.
   * @returns Exports of given `module` from given container.
   *
   * @example
   * ```ts
   * import * as React from 'react';
   * import { Federated } from '@callstack/repack/client';
   *
   * const Button = React.lazy(() => Federated.importModule('my-components', './Button.js'));
   *
   * const myUtil = await Federated.importModule('my-lib', './myUtil.js');
   * ```
   */
  async function importModule(containerName, module, scope = 'default') {
    if (!__webpack_share_scopes__[scope]?.__isInitialized) {
      // Initializes the share scope.
      // This fills it with known provided modules from this build and all remotes.
      await __webpack_init_sharing__(scope);
      __webpack_share_scopes__[scope].__isInitialized = true;
    }

    // Do not use `const container = self[containerName];` here. Once container is loaded
    // `container` reference is not updated, so `container.__isInitialized`
    // will crash the application, because of reading property from `undefined`.
    if (!self[containerName]) {
      // Download and execute container
      await ScriptManager.shared.loadScript(containerName);
    }
    const container = self[containerName];
    if (!container.__isInitialized) {
      container.__isInitialized = true;
      // Initialize the container, it may provide shared modules
      await container.init(__webpack_share_scopes__[scope]);
    }
    const factory = await container.get(module);
    const exports = factory();
    return exports;
  }
  _Federated.importModule = importModule;
})(Federated || (Federated = {}));
//# sourceMappingURL=federated.js.map