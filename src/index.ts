import {
  _JetPath_app_config,
  _JetPath_hooks,
  _JetPath_paths,
  compileUI,
  getHandlers,
  UTILS,
} from "./primitives/functions.js";
import {
  type allowedMethods,
  type AppCTX,
  type methods,
} from "./primitives/types.js";

export class JetPath {
  public server: any;
  private listening: boolean = false;
  private options: any;
  constructor(options?: {
    documentation?: {
      name?: string;
      info?: string;
      color?: string;
      logo?: string;
    };
    sources: Record<string, any>;
    credentials?: any;
    displayRoutes?: "UI";
    cors?:
      | {
          allowMethods?: allowedMethods;
          secureContext?: boolean;
          allowHeaders?: string[];
          exposeHeaders?: string[];
          keepHeadersOnError?: boolean;
          maxAge?: string;
          credentials?: boolean;
          privateNetworkAccess?: any;
          origin?: string;
        }
      | boolean;
  }) {
    this.options = options || { displayRoutes: true };
    // ? setting http routes automatically
    // ? setting up app configs
    for (const [k, v] of Object.entries(this.options)) {
      _JetPath_app_config.set(k, v);
    }
    if (!options?.cors) {
      _JetPath_app_config.set("cors", true);
    }
    this.server = UTILS.server();
  }
  decorate(decorations: Record<string, (ctx: AppCTX) => void>) {
    if (this.listening) {
      throw new Error("Your app is listening new decorations can't be added.");
    }
    if (typeof decorations !== "object") {
      throw new Error("could not add decoration to ctx");
    }
    UTILS.decorators = Object.assign(UTILS.decorators, decorations);
  }
  async listen() {
    // ? {-view-} here is replaced at build time to html
    let UI = `{{view}}`;

    if (
      typeof this.options !== "object" ||
      this.options?.displayRoutes !== false
    ) {
      let c = 0,
        t = "";
      await getHandlers(this.options.sources || []);
      for (const k in _JetPath_paths) {
        const r = _JetPath_paths[k as methods];
        if (r && Object.keys(r).length) {
          for (const p in r) {
            const v = UTILS.validators[p] || {};
            const b = v?.body || {};
            const h_inial = v?.headers || {};
            const h = [];
            for (const name in h_inial) {
              h.push(name + ":" + h_inial[name]);
            }
            const j: Record<string, any> = {};
            if (b) {
              for (const ke in b) {
                j[ke] = (b[ke as "info"] as any)?.inputType || "text";
              }
            }
            const api = `\n
${k} ${
              this.options?.displayRoutes === "UI"
                ? "[--host--]"
                : "http://localhost:" + (this.options?.port || 8080)
            }${p} HTTP/1.1
${h.length ? h.join("\n") : ""}\n
${v && (v.method === k && k !== "GET" ? k : "") ? JSON.stringify(j) : ""}\n${
              v && (v.method === k ? k : "") && v?.["info"]
                ? "#" + v?.["info"] + "-JETE"
                : ""
            }
###`;
            if (this.options.displayRoutes) {
              t += api;
            }
            c += 1;
          }
        }
      }

      if (this.options?.displayRoutes === "UI") {
        UI = compileUI(UI, this.options, t);
        _JetPath_paths["GET"]["/api-doc"] = (ctx) => {
          ctx.send(UI, "text/html");
        };
      }
    } else {
      await getHandlers(this.options.sources || []);
    }
    this.listening = true;
    this.server.listen();
  }
}

//? exports
export type { AppCTX, Schema } from "./primitives/types.js";
