<br/>
<p align="center">
     <img src="icon.webp" alt="JetPath" width="190" height="190">

  <h1 align="center" >JetPath - edge</h1>

  <p align="center">
    JetPath on the edge 🚀
    <br/>
    <br/>
    <a href="https://github.com/uiedbook/JetPath#examples"><strong>Explore JetPath APIs »</strong></a>
    <br/>
    <br/>
    <a href="https://t.me/uiedbookHQ">Join Community</a>
    .
    <a href="https://github.com/uiedbook/JetPath/issues">Report Bug</a>
    .
    <a href="https://github.com/uiedbook/JetPath/issues">Request Feature</a>
  </p>
</p>

![Contributors](https://img.shields.io/github/contributors/uiedbook/JetPath?color=dark-green)
[![npm Version](https://img.shields.io/npm/v/jetpath.svg)](https://www.npmjs.com/package/JetPath)
![Forks](https://img.shields.io/github/forks/uiedbook/JetPath?style=social)
![Stargazers](https://img.shields.io/github/stars/uiedbook/JetPath?style=social)

--

# Rationale

JetPath brings function-name as a route and the simplest modularity to the programming world.

It is a Small Server-side framework that is Fast and Easy to use, You can learn how to use it here. [Jetpath](https://github.com/Uiedbook/jetpath)

--

## Requirements to use JetPath.

JetPath edge provide support edge Javascript runtimes like Deno deploy and cloudflare workers:

## Installation

Install JetPath Right away on your project using npm or Javascript other package managers.

```
npm i jetpath-edge --save
```

## Usage

JetPath is very simple, it allows you to create the most actions in app in a very simple intuitive way.

#### A Basic App setup

```ts
// in your src/app.js
import JetPath from "jetpath";
import * as apis from "./src/routes/PathShop.js";

const app = new JetPath({
  source: apis,
  cors: true, // optional
});
//? listening for requests
app.listen();
```

#### Example routes

```ts
// in your ./src/routes/PathShop.js

import { AppCTX, Schema } from "../dist/index.js";

//? Body validators

export const BODY_pets: Schema = {
  name: { err: "please provide dog name", type: "string" },
  image: { type: "string", nullable: true, inputType: "file" },
  age: { type: "number" },
};
export const BODY_petBy$id: Schema = {
  name: { err: "please provide dog name", type: "string" },
  image: { type: "string", nullable: true, inputType: "file" },
  age: { type: "number" },
};
export const BODY_petImage$id: Schema = {
  image: { type: "string", inputType: "file" },
};

// ? Routes

// ? PETshop temperaly Database
const pets: { id: string; imageUrl: string; name: string }[] = [];

// ? /
export async function GET_(ctx: AppCTX) {
  ctx.send("Welcome to Petshop!");
}

// List Pets: Retrieve a list of pets available in the shop
// ? /pets
export function GET_pets(ctx: AppCTX) {
  ctx.send(pets);
}

// ? /petBy/19388
// Get a Pet by ID: Retrieve detailed information about a specific pet by its unique identifier
export function GET_petBy$id(ctx: AppCTX) {
  const petId = ctx.params?.id;
  const pet = pets.find((p) => p.id === petId);
  if (pet) {
    ctx.send(pet);
  } else {
    ctx.code = 404;
    ctx.send({ message: "Pet not found" });
  }
}

// ? /pets
// Add a New Pet: Add a new pet to the inventory
export async function POST_pets(ctx: AppCTX) {
  ctx.validate(await ctx.json());
  const newPet: { id: string; imageUrl: string; name: string } = ctx.body;
  // Generate a unique ID for the new pet (in a real scenario, consider using a UUID or another robust method)
  newPet.id = String(Date.now());
  pets.push(newPet);
  ctx.send({ message: "Pet added successfully", pet: newPet });
}

// Update a Pet: Modify the details of an existing pet
// ? /petBy/8766
export async function PUT_petBy$id(ctx: AppCTX) {
  ctx.validate(await ctx.json());
  const petId = ctx.params.id;
  const updatedPetData = await ctx.json();
  const index = pets.findIndex((p) => p.id === petId);
  if (index !== -1) {
    // Update the existing pet's data
    pets[index] = { ...pets[index], ...updatedPetData };
    ctx.send({ message: "Pet updated successfully", pet: pets[index] });
  } else {
    ctx.code = 404;
    ctx.send({ message: "Pet not found" });
  }
}

// ? /petBy/8766
// Delete a Pet: Remove a pet from the inventory
export function DELETE_petBy$id(ctx: AppCTX) {
  const petId = ctx.params.id;
  const index = pets.findIndex((p) => p.id === petId);
  if (index !== -1) {
    const deletedPet = pets.splice(index, 1)[0];
    ctx.send({ message: "Pet deleted successfully", pet: deletedPet });
  } else {
    ctx.code = 404;
    ctx.send({ message: "Pet not found" });
  }
}

// ? /petImage/76554
// Upload a Pet's Image: Add an image to a pet's profile
export async function POST_petImage$id(ctx: AppCTX) {
  const petId = ctx.params.id;
  // @ts-ignore
  console.log(ctx.request);
  const formdata = await ctx.request.formData();
  console.log(formdata);
  const profilePicture = formdata.get("image");
  if (!profilePicture) throw new Error("Must upload a profile picture.");
  console.log({ formdata, profilePicture });

  const index = pets.findIndex((p) => p.id === petId);
  if (index !== -1) {
    // Attach the image URL to the pet's profile (in a real scenario, consider storing images externally)
    pets[index].imageUrl = `/images/${petId}.png`;
    // write profilePicture to disk
    // @ts-ignore
    await Bun.write(pets[index].imageUrl, profilePicture);
    ctx.send({
      message: "Image uploaded successfully",
      imageUrl: pets[index].imageUrl,
    });
  } else {
    ctx.code = 404;
    ctx.send({ message: "Pet not found" });
  }
}

// ? error hook
export function hook__ERROR(ctx: AppCTX, err: unknown) {
  ctx.code = 400;
  console.log(err);
  ctx.send(String(err));
}

//? hooks
export function hook__POST(ctx, data) {
  ctx.throw("no handlers for this request");
}

export function hook__PRE(ctx) {
  console.log(ctx.method);
}
```

### ctx Overview at current

ctx is th JetPath parameter your route functions are called with.

```ts
export type AppCTX = {
  json(): Promise<Record<string, any>> | undefined;
  validate(data: any): Record<string, any>;
  code: number;
  search: Record<string, string>;
  params: Record<string, string>;
  request: IncomingMessage | Request;
  send(data: unknown, ContentType?: string): void;
  throw(
    code?: number | string | Record<string, any> | unknown,
    message?: string | Record<string, any>
  ): void;
  redirect(url: string): void;
  get(field: string): string | undefined;
  set(field: string, value: string): void;
  app: Record<string, any>;
};
```

When improvements and changes rolls out, we will quickly update this page and the currently prepared [web documentation]("https://uiedbook.gitbook.io/jetpath/").

## Where's JetPath future gonna be like?

We have exhausted our Roadmap, let's me what your suggestions are!

## Apache 2.0 Lincenced

Opensourced And Free.

Uiedbook is an open source team of web focused engineers, their vision is to make the web better, improving and innovating infrastructures for a better web experience.

You can Join the [Uiedbook group]("https://t.me/UiedbookHQ") on telegram.
Ask your questions and become a team-member/contributor by becoming an insider.

### Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your code to be distributed under the MIT license. You are also implicitly verifying that all code is your original work.

### Support

Your contribution(s) is a good force for change anytime you do it, you can ensure JetPath's growth and improvement by contributing a re-occuring or fixed donations to:

https://www.buymeacoffee.com/fridaycandour

Or Click.

<a href="https://www.buymeacoffee.com/fridaycandour"><img src="https://img.buymeacoffee.com/button-api/?text=Buy us a coffee&emoji=&slug=fridaycandour&button_colour=FFDD00&font_colour=000000&outline_colour=000000&coffee_colour=ffffff" /></a>
