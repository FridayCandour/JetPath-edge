const routes = {
  "/h": true,
  "/h/:poop": true,
  "/h/:poop/?": true,
  "/p/x/*": true,
};

const URLPARSER1 = (url: string) => {
  //   if (!UTILS.runtime["node"]) {
  //     url = url.slice(url.indexOf("/", 7));
  //   }
  if (routes[url]) {
    return [routes[url], {}, {}, url];
  }
  const search: Record<string, string> = {},
    params: Record<string, string> = {};
  let path: string | undefined, handler: true | undefined;
  //? place holder & * route checks
  for (const pathR in routes) {
    // ? /* check
    if (pathR.includes("*")) {
      const Ried = pathR.slice(0, pathR.length - 1);
      if (url.includes(Ried)) {
        params.extraPath = url.slice(Ried.length);
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

const URLPARSER2 = (url: string) => {
  if (routes[url]) {
    return [routes[url], {}, {}, url];
  }
  //? check for extra / in the route
  // if (routes[url + "/"]) {
  //   return [routes[url], {}, {}, url];
  // }
  //? check for search in the route
  if (url.includes("/?")) {
    const sraw = [...new URLSearchParams(url).entries()];
    const search: Record<string, string> = {};
    for (const idx in sraw) {
      search[
        sraw[idx][0].includes("?") ? sraw[idx][0].split("?")[1] : sraw[idx][0]
      ] = sraw[idx][1];
    }
    const path = url.split("/?")[0] + "/?";
    if (routes[path]) {
      return [routes[path], {}, search, path];
    }
    return;
  }

  //? place holder & * route checks
  for (const path in routes) {
    // ? placeholder check
    if (path.includes(":")) {
      const urlFixtures = url.split("/");
      const pathFixtures = path.split("/");
      //? check for extra / in the route by normalize before checking
      if (url.endsWith("/")) {
        urlFixtures.pop();
      }
      let fixturesX = 0;
      let fixturesY = 0;
      //? length check of / (backslash)
      if (pathFixtures.length === urlFixtures.length) {
        for (let i = 0; i < pathFixtures.length; i++) {
          //? let's jump place holders in the path since we can't determine from them
          //? we increment that we skipped a position because we need the count later
          if (pathFixtures[i].includes(":")) {
            fixturesY++;
            continue;
          }
          //? if it is part of the path then let increment a value for it
          //? we will need it later
          if (urlFixtures[i] === pathFixtures[i]) {
            fixturesX++;
          }
        }
        //? if after the checks it all our count are equal then we got it correctly
        if (fixturesX + fixturesY === pathFixtures.length) {
          const routesParams: Record<string, string> = {};
          for (let i = 0; i < pathFixtures.length; i++) {
            if (pathFixtures[i].includes(":")) {
              routesParams[pathFixtures[i].split(":")[1]] = urlFixtures[i];
            }
          }
          return [routes[path], routesParams, {}, path];
        }
      }
    }
    // ? * check
    if (path.includes("*")) {
      const p = path.slice(0, -1);
      if (url.startsWith(p)) {
        return [routes[path], { extraPath: url.slice(p.length) }, {}, path];
      }
    }
  }
  return;
};
// console.log({
//   A: URLPARSER("/h"),
//   B: URLPARSER("/h/foo"),
//   C: URLPARSER("/h/foo/?name=bar"),
//   D: URLPARSER("/p/x/bar.txt"),
// });
async function benchSuit(code, runs = 10000000, lab) {
  const startTime = performance.now();
  for (let i = 0; i < runs; i++) {
    code();
  }
  const endTime = performance.now();
  let totalTime = endTime - startTime;
  console.log(
    `Code took ${totalTime} ms on ${runs} runs with an average of ${
      totalTime / runs
    } ms per operation`
  );
  if (lab) {
    console.log(lab);
  }
  return totalTime;
}

benchSuit(() => URLPARSER1("/h/foo/?name=bar"), undefined, "1");
benchSuit(() => URLPARSER2("/h/foo/?name=bar"), undefined, "2");
