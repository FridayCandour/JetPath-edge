import { JetPath } from "../dist/index.js";
import * as rs from "./app.routes.js";
const app = new JetPath({
  documentation: {
    name: "PetShop API Doc",
    info: `
    PetShop API Documentation

    This doc provides you with a simple read and write Api to The PetShop API
    `,
    logo: "https://raw.githubusercontent.com/Uiedbook/JetPath/main/icon-transparent.webp",
  },
  sources: rs,
  // displayRoutes: "UI",
});

app.listen();
