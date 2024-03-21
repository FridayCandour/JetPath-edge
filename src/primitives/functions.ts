// compartible node imports
import {
  type AppCTX,
  type Schema,
  type allowedMethods,
  type methods,
} from "./types.js";

/**
 * an inbuilt CORS post hook
 *
 * @param {Object} [options]
 *  - {String|Function(ctx)} origin `Access-Control-Allow-Origin`, default is request Origin header
 *  - {String|Array} allowMethods `Access-Control-Allow-Methods`, default is 'GET,HEAD,PUT,POST,DELETE,PATCH'
 *  - {String|Array} exposeHeaders `Access-Control-Expose-Headers`
 *  - {String|Array} allowHeaders `Access-Control-Allow-Headers`
 *  - {String|Number} maxAge `Access-Control-Max-Age` in seconds
 *  - {Boolean|Function(ctx)} credentials `Access-Control-Allow-Credentials`
 *  - {Boolean} keepHeadersOnError Add set headers to `err.header` if an error is thrown
 *  - {Boolean} secureContext `Cross-Origin-Opener-Policy` & `Cross-Origin-Embedder-Policy` headers.', default is false
 *    @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/Planned_changes
 *  - {Boolean} privateNetworkAccess handle `Access-Control-Request-Private-Network` request by return `Access-Control-Allow-Private-Network`, default to false
 *    @see https://wicg.github.io/private-network-access/
 * @return {Function} cors post hook
 * @public
 */

export function corsHook(options: {
  exposeHeaders?: string[];
  allowMethods?: allowedMethods;
  allowHeaders: string[];
  keepHeadersOnError?: boolean;
  maxAge?: string;
  credentials?: boolean;
  secureContext?: boolean;
  privateNetworkAccess?: any;
  origin: string[];
}): Function {
  if (Array.isArray(options.allowMethods)) {
    options.allowMethods = options.allowMethods.join(
      ","
    ) as unknown as methods[];
  }

  if (options.maxAge) {
    options.maxAge = String(options.maxAge);
  }

  options.keepHeadersOnError =
    options.keepHeadersOnError === undefined || !!options.keepHeadersOnError;

  return function cors(ctx: AppCTX) {
    //? Add Vary header to indicate response varies based on the Origin header
    ctx.set("Vary", "Origin");
    if (options.credentials === true) {
      ctx.set("Access-Control-Allow-Credentials", "true");
    } else {
      //? Simple Cross-Origin Request, Actual Request, and Redirects
      ctx.set("Access-Control-Allow-Origin", options.origin!.join(","));
    }
    if (ctx.request.method !== "OPTIONS") {
      // if (options.exposeHeaders) {
      //   ctx.set(
      //     "Access-Control-Expose-Headers",
      //     options.exposeHeaders.join(",")
      //   );
      // }

      // if (options.secureContext) {
      //   ctx.set("Cross-Origin-Opener-Policy", "unsafe-none");
      //   ctx.set("Cross-Origin-Embedder-Policy", "unsafe-none");
      // }
      if (options.allowHeaders) {
        ctx.set("Access-Control-Allow-Headers", options.allowHeaders.join(","));
      }
    } else {
      //? Preflight Request

      if (options.maxAge) {
        ctx.set("Access-Control-Max-Age", options.maxAge);
      }

      if (
        options.privateNetworkAccess &&
        ctx.get("Access-Control-Request-Private-Network")
      ) {
        ctx.set("Access-Control-Allow-Private-Network", "true");
      }

      if (options.allowMethods) {
        ctx.set("Access-Control-Allow-Methods", options.allowMethods.join(","));
      }

      if (options.secureContext) {
        ctx.set("Cross-Origin-Opener-Policy", "same-origin");
        ctx.set("Cross-Origin-Embedder-Policy", "require-corp");
      }

      if (options.allowHeaders) {
        ctx.set("Access-Control-Allow-Headers", options.allowHeaders.join(","));
      }
      ctx.code = 204;
    }
  };
}

export const UTILS = {
  ae(cb: { (): any; (): any; (): void }) {
    try {
      cb();
      return true;
    } catch (error) {
      return false;
    }
  },
  set() {
    // @ts-ignore
    const deno = UTILS.ae(() => Deno);
    this.runtime = { deno, cfw: !deno };
  },
  runtime: null as unknown as Record<string, boolean>,
  decorators: {},
  validators: {} as Record<string, Schema>,
  server(): { listen: any } | void {
    return {
      listen() {
        if (UTILS.runtime["worker"]) {
          // @ts-ignore
          self.fetch = JetPath_app;
        }
        if (UTILS.runtime["deno"]) {
          // @ts-ignore
          Deno.serve({}, JetPath_app);
        }
      },
    };
  },
};
// ? setting up the runtime check
UTILS.set();

export let _JetPath_paths: Record<
  methods,
  Record<string, (ctx: AppCTX) => void | Promise<void>>
> = {
  GET: {},
  POST: {},
  HEAD: {},
  PUT: {},
  PATCH: {},
  DELETE: {},
  OPTIONS: {},
};
export const _JetPath_hooks: Record<
  string,
  (ctx: AppCTX) => void | Promise<void>
> = {};

class JetPathErrors extends Error {
  constructor(message: string) {
    super(message);
  }
}

const _DONE = new JetPathErrors("done");
const _OFF = new JetPathErrors("off");

export const _JetPath_app_config = {
  cors: false as unknown as (ctx: AppCTX) => void,
  set(this: any, opt: string, val: any) {
    if (opt === "cors" && val !== false) {
      this.cors = corsHook({
        exposeHeaders: [],
        allowMethods: [],
        allowHeaders: ["*"],
        maxAge: "",
        keepHeadersOnError: true,
        secureContext: false,
        privateNetworkAccess: false,
        origin: ["*"],
        credentials: undefined,
        ...(typeof val === "object" ? val : {}),
      }) as any;
      if (Array.isArray(val["allowMethods"])) {
        _JetPath_paths = {} as any;
        for (const med of val["allowMethods"]) {
          _JetPath_paths[med.toUpperCase() as "GET"] = {};
        }
      }
      return;
    }
    this[opt] = val;
  },
};

const createCTX = (
  req: Request,
  decorationObject: Record<string, Function> = {}
): AppCTX => ({
  ...decorationObject,
  app: {},
  request: req,
  code: 200,
  send(data: unknown, contentType: string) {
    let ctype;
    switch (typeof data) {
      case "string":
        ctype = "text/plain";
        this._1 = data;
        break;
      case "object":
        ctype = "application/json";
        this._1 = JSON.stringify(data);
        break;
      default:
        ctype = "text/plain";
        this._1 = String(data);
        break;
    }
    if (contentType) {
      ctype = contentType;
    }
    if (!this._2) {
      this._2 = {};
    }
    this._2["Content-Type"] = ctype;
    this._4 = true;
    if (!this._5) throw _DONE;
    this._5();
    return undefined as never;
  },
  redirect(url: string) {
    this.code = 301;
    if (!this._2) {
      this._2 = {};
    }
    this._2["Location"] = url;
    this._1 = undefined;
    this._4 = true;
    if (!this._5) throw _DONE;
    this._5();
    return undefined as never;
  },
  throw(code: unknown = 404, message: unknown = "Not Found") {
    // ? could be a success but a wrong throw, so we check
    if (!this._2) {
      this._2 = {};
    }
    if (!this._4) {
      this.code = 400;
      switch (typeof code) {
        case "number":
          this.code = code;
          if (typeof message === "object") {
            this._2["Content-Type"] = "application/json";
            this._1 = JSON.stringify(message);
          } else if (typeof message === "string") {
            this._2["Content-Type"] = "text/plain";
            this._1 = message;
          }
          break;
        case "string":
          this._2["Content-Type"] = "text/plain";
          this._1 = code;
          break;
        case "object":
          this._2["Content-Type"] = "application/json";
          this._1 = JSON.stringify(code);
          break;
      }
    }
    this._4 = true;
    if (!this._5) throw _DONE;
    this._5();
    return undefined as never;
  },
  get(field: string) {
    if (field) {
      return this.request.headers.get(field) as string;
    }
    return undefined;
  },

  set(field: string, value: string) {
    if (!this._2) {
      this._2 = {};
    }
    if (field && value) {
      this._2[field] = value;
    }
  },
  eject() {
    throw _OFF;
  },

  json<Type = Record<string, any>>(): Promise<Type> {
    try {
      return (this.request as unknown as Request).json();
    } catch (error) {
      return {} as Promise<Type>;
    }
  },
  validate(data: any = {}) {
    if (UTILS.validators[this.path]) {
      return validate(UTILS.validators[this.path!], data);
    }
    throw new Error("no validation BODY! for path " + this.path);
  },
  params: {},
  search: {},
  path: "/",
  //? load
  // _1: undefined,
  //? header of response
  // _2: {},
  // //? stream
  // _3: undefined,
  //? used to know if the request has ended
  // _4: false,
  //? used to know if the request has been offloaded
  // _5: false
});

const createResponse = (ctx: AppCTX, four04?: boolean) => {
  //? add cors headers
  _JetPath_app_config.cors(ctx);

  if (ctx?.code === 301 && ctx._2?.["Location"]) {
    return Response.redirect(ctx._2?.["Location"]);
  }
  return new Response(ctx?._1 || (four04 ? "Not found" : undefined), {
    status: ctx?.code || 404,
    headers: ctx?._2,
  });
};

const JetPath_app = async (req: Request) => {
  const paseredR = URLPARSER(req.method as methods, req.url!);
  let off = false;
  let ctx;
  if (paseredR) {
    ctx = createCTX(req, UTILS.decorators);
    const r = paseredR[0];
    ctx.params = paseredR[1] as any;
    ctx.search = paseredR[2] as any;
    ctx.path = paseredR[3] as any;
    try {
      //? pre-request hooks here
      await _JetPath_hooks["PRE"]?.(ctx);
      //? route handler call
      await (r as any)(ctx);
      //? post-request hooks here
      await _JetPath_hooks["POST"]?.(ctx);
      return createResponse(ctx);
    } catch (error) {
      if (error instanceof JetPathErrors) {
        if (error.message !== "off") {
          return createResponse(ctx);
        } else {
          off = true;
        }
      } else {
        //? report error to error hook
        try {
          // @ts-ignore
          await _JetPath_hooks["ERROR"]?.(ctx, error);
          //! if expose headers on error is
          //! false remove this line so the last return will take effect;
          return createResponse(ctx);
        } catch (error) {
          return createResponse(ctx);
        }
      }
    }
  }
  if (!off) {
    return createResponse(createCTX(req), true);
  } else {
    return new Promise((r) => {
      ctx!._5 = () => {
        r(createResponse(ctx!, true));
      };
    });
  }
};

const Handlerspath = (path: any) => {
  if ((path as string).includes("hook__")) {
    //? hooks in place
    return (path as string).split("hook__")[1];
  }
  //? adding /(s) in place
  path = path.split("_");
  const method = path.shift();
  path = "/" + path.join("/");
  //? adding ?(s) in place
  path = path.split("$$");
  path = path.join("/?");
  //? adding * in place
  path = path.split("$0");
  path = path.join("/*");
  //? adding :(s) in place
  path = path.split("$");
  path = path.join("/:");
  if (/(GET|POST|PUT|PATCH|DELETE|OPTIONS|BODY)/.test(method)) {
    //? adding methods in place
    return [method, path] as [methods, string];
  }
  return;
};
export async function getHandlers(source: ((ctx: AppCTX) => void)[]) {
  let r = 0,
    b = 0,
    hh = 0,
    d = 0;
  if (Array.isArray(source)) {
    throw new Error("sources must be an object");
  }
  // @ts-ignore
  for (const h in source) {
    try {
      const module = source[h as keyof typeof source] as (
        ctx?: AppCTX
      ) => void | Promise<any>;
      const params = Handlerspath((module as any).name as string);
      if (params) {
        if (params[0] === "BODY") {
          // ! BODY parser
          const validator = module as unknown as {
            validate: (data: any) => Record<string, any>;
            method: methods;
          };
          if (validator.method) {
            b += 1;
            UTILS.validators[params[1]] = validator as Schema;
            validator.validate = (data: any = {}) => validate(validator, data);
          }
        }
        if (
          typeof params !== "string" &&
          _JetPath_paths[params[0] as methods]
        ) {
          // ! HTTP handler
          _JetPath_paths[params[0] as methods][params[1]] = module;
          r += 1;
        } else {
          if ("POST-PRE-ERROR".includes(params as string)) {
            _JetPath_hooks[params as string] = module;
            hh += 1;
          } else {
            if (params === "DECORATOR") {
              // ! DECORATOR point
              d += 1;
              const decorator = module();
              if (typeof decorator === "object") {
                UTILS.decorators = Object.assign(UTILS.decorators, decorator);
              }
            }
          }
        }
      }
    } catch (error) {}
  }
  // ? report
  console.log(
    `Jetpath: parsed ${r} routes, ${hh} hooks, ${b} BODY and ${d} decorators`
  );
}

export function validate(schema: Schema, data: any) {
  const out: Record<string, any> = {};
  let errout: string = "";
  if (!data) throw new Error("invalid data => " + data);
  if (!schema) throw new Error("invalid schema => " + schema);
  for (const [prop, value] of Object.entries(schema.body || {})) {
    const { err, type, nullable, RegExp, validator } = value;
    if (!data[prop] && nullable) {
      continue;
    }
    if (!data[prop] && !nullable) {
      if (err) {
        errout = err;
      } else {
        errout = `${prop} is required`;
      }
      continue;
    }
    if (validator && !validator(data[prop])) {
      if (err) {
        errout = err;
      } else {
        errout = `${prop} must is invalid`;
      }
      continue;
    }
    if (typeof RegExp === "object" && !RegExp.test(data[prop])) {
      if (err) {
        errout = err;
      } else {
        errout = `${prop} must is invalid`;
      }
      continue;
    }

    out[prop] = data[prop];

    if (type) {
      if (typeof type === "function") {
        if (typeof type(data[prop]) !== typeof type()) {
          if (err) {
            errout = err;
          } else {
            errout = `${prop} type is invalid '${data[prop]}' `;
          }
          continue;
        }
        out[prop] = type(data[prop]);
      }
      if (typeof type === "string" && type !== typeof data[prop]) {
        if (err) {
          errout = err;
        } else {
          errout = `${prop} type is invalid '${data[prop]}' `;
        }
      }
      //
      continue;
    }
  }
  if (errout) throw new Error(errout);
  return out;
}

const URLPARSER = (method: methods, url: string) => {
  const routes = _JetPath_paths[method];
  if (!UTILS.runtime["node"]) {
    url = url.slice(url.indexOf("/", 7));
  }
  if (routes[url]) {
    return [routes[url], {}, {}, url];
  }
  const search: Record<string, string> = {},
    params: Record<string, string> = {};
  let path: string | undefined, handler: Function | undefined;
  //? place holder & * route checks
  for (const pathR in routes) {
    // ? /* check
    if (pathR.includes("*")) {
      const Ried = pathR.slice(0, pathR.length - 1);
      if (url.includes(Ried)) {
        (params as any).extraPath = url.slice(Ried.length);
        path = pathR;
        //? set path and handler
        handler = routes[path];
        break;
      }
    }
    // ? placeholder /: check
    if (pathR.includes(":")) {
      const urlFixtures = url.split("/");
      const pathFixtures = pathR.split("/");
      let fixtures = 0;
      for (let i = 0; i < pathFixtures.length; i++) {
        //? let's jump place holders in the pathR since we can't determine from them
        //? we increment that we skipped a position because we need the count later
        if (pathFixtures[i].includes(":")) {
          fixtures++;
          continue;
        }
        //? if it is part of the pathR then let increment a value for it
        //? we will need it later
        if (urlFixtures[i] === pathFixtures[i]) {
          fixtures++;
        }
      }
      //? if after the checks it all our count are equal then we got it correctly
      if (fixtures === pathFixtures.length) {
        for (let i = 0; i < pathFixtures.length; i++) {
          const px = pathFixtures[i];
          if (px.includes(":")) {
            params[px.split(":")[1]] = urlFixtures[i];
          }
        }
        path = pathR;
        //? set path and handler
        handler = routes[path];
        break;
      }
    }
  }
  //? check for search in the route
  if (url.includes("/?")) {
    path = url.split("/?")[0] + "/?";
    const sraw = url.slice(path.length).split("=");
    for (let s = 0; s < sraw.length; s = s + 2) {
      search[sraw[s]] = sraw[s + 1];
    }
    if (routes[path]) {
      handler = routes[path];
    }
  }
  if (handler) {
    return [handler, params, search, path];
  }
};

export const compileUI = (UI: string, options: any, api: string) => {
  return UI.replace("'{JETPATH}'", `\`${api}\``)
    .replaceAll("{NAME}", options?.documentation?.name || "JethPath API Doc")
    .replaceAll("JETPATHCOLOR", options?.documentation?.color || "#007bff")
    .replaceAll(
      "{LOGO}",
      options?.documentation?.logo ||
        "https://raw.githubusercontent.com/Uiedbook/JetPath/main/icon-transparent.webp"
    )
    .replaceAll(
      "{INFO}",
      options?.documentation?.info || "This is a JethPath api preview."
    );
};
