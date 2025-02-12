# Decentralized Web Node Package Manager (DWNPM)

<img src="/assets/img/logo/octopus.webp" height=250 width=250 />

## Learn

Learn the [Vocabulary & Acronyms](#eli5-vocabulary--acronyms)

## Summary

DWNPM - npm for the DWeb. Using DWNPN, developers can:

* Run a Decentralized Web Node Package Registry server
* Install, publish and manage Decentralized Web Node Packages
* Interact with Decentralized Web Node Package Registry servers

## Table of Contents

* [Setup](#setup)
* [Usage](#usage)
* [Summary](#summary)
* [Goals](#goals)
* [Details](#details)
  * [Dependencies](#dependencies)
  * [Namespace](#namespace)
  * [DID Methods](#did-methods)
  * [NPM Compatible](#npm-compatible)
  * [Node.js Runtime (Register/Hooks)](#nodejs-runtime-registerhooks)
* [Tools](#tools)
  * [Decentralized Web Node Package Explorer (DPX)](#decentralized-web-node-package-explorer-dpx)
  * [Decentralized Web Node Package Registry (DPR)](#decentralized-web-node-package-registry-dpr)
  * [Decentralized Web Node Package Manager (DPM)](#decentralized-web-node-package-manager-dpm)
  * [Decentralized Web Node Package Import](#decentralized-web-node-package-import-dpi)
* [ELI5 Vocabulary & Acroynms](#eli5-vocabulary--acronyms)
  * [Web5 Vocab](#web5-vocab)
  * [DWNPM Vocab](#dwnpm-vocab)
  * [Other Vocab](#other-vocab)
* [Project Resources](#project-resources)

## Setup

For setup, see [SETUP.md](/docs/SETUP.md).

## Usage

For usage, see [USAGE.md](/docs/USAGE.md).

## Summary

DWNPM is a set of tools using DIDs to publish, install, and interact with DWNPKs published to a DWN. Every DID created has a DID Document containing relevant information for how to interact with that DID.

In the case of DWNPM, we add the DID Method and ID to the package name, so the registry server can lookup the DID document using the DID method (which defines where the DID doc was stored, i.e. which decentralized storage network).

DWNPM supports one DID method - DHT - with upcoming support for DID WEB and DID BTC. The creation of a DID DHT requires the inclusion of a DWN endpoint. This endpoint is included in the DID document under the "service" section.

```json
{
 "service": [
    {
      "id": "did:dht:tqa1ep34zbg3kwrt89irbj6sib333ps1ued5frwbug39meq3a4oy",
      "type": "DecentralizedWebNode",
      "serviceEndpoint": [
        "https://dwn.example.org/"
      ],
      "enc": "#enc",
      "sig": "#sig"
    }
  ]
  }
```

The service key is a list of objects where each object defines a service available to that DID. In this case, the service used is called `DecentralizedWebNode`.

Resolving the DID yields the doc yields the endpoint yields the location for record reads and creates. To participate, you merely need to install the DWNPM protocol into your DWN. To view the protocol rules, checkout out [dwnpm.tools/protocols/dwnpm](https://dwnpm.tools/protocols/dwnpm).

## Goals

The goal of DWNPM is to decentralize package management, putting control of the packages in the hands of the users - not the package registry or package manager. This ensures reliability by eliminating the possibility for broken links. With DWNPM, publishers write code to their DWNs.

Developers can discover packages here just like npmjs.com, except explorer.dwnpm.sofware does not store the code, only offers publishers the ability to list it for discovery. The publishers store the code in their own DWNs and users can query, download and keep a copy of that code as immutable and source in their own DWN. This forever eliminates the possiblity for broken links or censorship.

Npmjs packages are published under usernames or organization names. Devs can publish packages directly to npmjs under the package name and organizations can have an organization username (such as `@web5`) with a list of packages that under that org name. This paradigm is well known and understood but has a limited namespace resulting in gatekeeping, sniping or squatting.

## Details

The below sections outline various details differentiating DWNPM, explaining how it works and why its an improvement on the current centralized solutions.

### Dependencies

DWNPM reuses the `package.json` and `package-lock.json` files for easy integration to the normal `npm` dev env. The same principles apply: the entries in each file ensure version locking and integrity hashing. This approach guarantees that packages are always accessible and versioned securely, enabling a more resilient and trustworthy ecosystem for software distribution

* DWNPM intercepts `npm install` and redirects the GET calls to a registry running on `localhost:2092`
* This registry is a simple express server mimicking the paths used by npm to `GET` pacakges from `registry.npmjs.org`
* The express server parses API url path to construct a DRL (Decentralized Resource Locator)
* DWNPM requests the DPK from the DWN found in the DID doc associated with the DID from the dependency version string
* The registry server installs the DPK metadata and tarball into a local folder called `.registry` and passes the path to the tarball back to the `npm install` cli call
* From there, `npm` handles the rest normally installing the tarball into `node_modules` under `@dwnpm/{packageName}/{version}`
* Integrity hashes are produced using the DPK.tgz content ensuring the publisher cannot swap out code under a specific verion in the protocol path.
* Additionally, DWNPM allows developers to republish the code pulled from the remote DWN to their own DWN, forever allowing them to secure an immutable copy
* Once a release is published and copied to your own DWN, it can only be changed by the DWN owner.
* To see the custom registry server, check out [registry.ts](/src/registry/registry.ts)

**Example package.json**

```json
{
    "dependencies": {
        "@dwnpm/tool5~8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo": "^6.1.0",
        "@dwnpm/express~8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo": "^4.21.1", 
        "@dwnpm/react~web~dwn.nonni.org": "^18.3.1", // Example of did:web
        "@dwnpm/next~btc~xg4x-ay5y-q5zq-232": "^15.0.2", // Example of did:btc
    }
}
```

**Example package-lock.json**

```json
{
    "node_modules/@dwnpm/express~8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo": {
      "version": "4.21.1",
      "resolved": "http://dwn.nonni.org/did:dht:dhdsxf8w7rd36i5jx8hcpw8hkg1cg8sjhepm1n9iuj55zd3gpjdy/read/protocols/aHR0cHM6Ly9kcnBtLnRvb2xzL3Byb3RvY29scy9kcnBt/package/release?filter.tags.name=@dwnpm/express~8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo&filter.tags.version=4.21.1",
      "integrity": "sha512-7oag0DgteUmGA5Hg2ixMjW4ogs+q59v3ir/5I38PqueZsO49t5Y9TPIF+0Zz1ZJRHPYM43eok73pv0BlhxpOrw==",
      "license": "ISC",
      "dependencies": {}
    },
    "node_modules/@dwnpm/tool5~8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo": {
      "version": "6.1.0",
      "resolved": "https://dwn.nonni.org/did:dht:dhdsxf8w7rd36i5jx8hcpw8hkg1cg8sjhepm1n9iuj55zd3gpjdy/read/protocols/aHR0cHM6Ly9kcnBtLnRvb2xzL3Byb3RvY29scy9kcnBt/package/release?filter.tags.name=@dwnpm/express~8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo&filter.tags.version=6.1.0",
      "integrity": "sha512-7oag0DgteUmGA5Hg2ixMjW4ogs+q59v3ir/5I38PqueZsO49t5Y9TPIF+0Zz1ZJRHPYM43eok73pv0BlhxpOrw==",
      "license": "ISC",
      "dependencies": {}
    },
    "node_modules/@dwnpm/react~web~nonni.org": {
        "version": "18.3.1",
        "resolved": "https://dwn.nonni.org/did:dht:dhdsxf8w7rd36i5jx8hcpw8hkg1cg8sjhepm1n9iuj55zd3gpjdy/read/protocols/aHR0cHM6Ly9kcnBtLnRvb2xzL3Byb3RvY29scy9kcnBt/package/release?filter.tags.name=@dwnpm/react~web~dwn.nonni.org&filter.tags.version=18.3.1",
      "integrity": "sha512-7oag0DgteUmGA5Hg2ixMjW4ogs+q59v3ir/5I38PqueZsO49t5Y9TPIF+0Zz1ZJRHPYM43eok73pv0BlhxpOrw==",
      "license": "ISC",
      "dependencies": {}
    },
    "node_modules/@dwnpm/next~btc~xg4x-ay5y-q5zq-232": {
        "version": "15.0.2",
       "resolved": "https://dwn.nonni.org/did:dht:dhdsxf8w7rd36i5jx8hcpw8hkg1cg8sjhepm1n9iuj55zd3gpjdy/read/protocols/aHR0cHM6Ly9kcnBtLnRvb2xzL3Byb3RvY29scy9kcnBt/package/release?filter.tags.name=@dwnpm/next~btc~xg4x-ay5y-q5zq-232&filter.tags.version=15.0.2",
      "integrity": "sha512-7oag0DgteUmGA5Hg2ixMjW4ogs+q59v3ir/5I38PqueZsO49t5Y9TPIF+0Zz1ZJRHPYM43eok73pv0BlhxpOrw==",
      "license": "ISC",
      "dependencies": {}
    }
}
```

### Namespace

In DWNPM, packages are published to DWNs referenced by DIDs. Any entity can have a DID: user, org, device, etc. This unlimits the namespace and eliminates gatekeeping and censorship.

* NPM User [npmjs.com/~bnonni](https://npmjs.com/~bnonni)
* NPM Organization: [npmjs.com/org/web5](https://npmjs.com/org/web5)
* NPM Package: [npmjs.com/package/tool5](https://npmjs.com/package/tool5)

* DWNPM User [did:dht:dhdsxf8w7rd36i5jx8hcpw8hkg1cg8sjhepm1n9iuj55zd3gpjdy](https://nonni.org/.well-known/did)
* DWNPM Organization [did:web:dwnpm.tools](https://dwnpm.tools/.well-known/did)
* DWNPM Package [@dwnpm/tool5~dhdsxf8w7rd36i5jx8hcpw8hkg1cg8sjhepm1n9iuj55zd3gpjdy](https://dwn.nonni.org/did:dht:dhdsxf8w7rd36i5jx8hcpw8hkg1cg8sjhepm1n9iuj55zd3gpjdy/read/protocols/aHR0cHM6Ly9kcnBtLnRvb2xzL3Byb3RvY29scy9kcnBt/package/release?filter.tags.name=@dwnpm/express~8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo&filter.tags.version=6.1.0)

### DID Methods

DWNPM only supports 3 DID Methods "out-of-the-box". If you want a method included, please feel free to open an issue and corresponding PR.

1. [`did:dht`](https://did-dht.com) = Uses BitTorrent Mainline DHT
2. [`did:web`](https://w3c-ccg.github.io/did-method-web) = Uses DNS and web servers
3. [`did:btc`](https://microstrategy.github.io/did-btc-spec) = Uses Bitcoin (Coming Soon!)

If no DID method is included, DWNPM assumes `dht`. Otherwise, you should list the correct DID method should dependency name in package.json using this general format:

**Package Naming Format**

```json
{
    "@dwnpm/packageName~didMethod~methodSpecificId": "[p]M.m.p"
}
```

**Package Naming Example**

```json
{
    "@dwnpm/tool5~dhdsxf8w7rd36i5jx8hcpw8hkg1cg8sjhepm1n9iuj55zd3gpjdy": "^2.1.2",
    "@dwnpm/react~web~nonni.org": "^18.3.1",
    "@dwnpm/next~btc~xg4x-ay5y-q5zq-232": "^2.1.2"
}
```

**How does DWNPM lookup packages?**

Using the DID Method (method) and Method Specific Idetifier (method id) listed in the dependency object in package.json. By passing the listed method to a Universal Resolver, DWNPM can lookup any id on the corresponding method storage network.

Resolving the id yields the DID Document for that id located on the method network. If that DID Document includes a `service` field with a DWN object, DWNPM can use the endpoint listed to make REST API calls to the DWN endpoint to retrieve packages.

**Example DID Document**

```json
{
  "id": "did:dht:tqa1ep34zbg3kwrt89irbj6sib333ps1ued5frwbug39meq3a4oy",
  "verificationMethod": [
    {
      "id": "did:dht:tqa1ep34zbg3kwrt89irbj6sib333ps1ued5frwbug39meq3a4oy#0",
      "type": "JsonWebKey",
      "controller": "did:dht:tqa1ep34zbg3kwrt89irbj6sib333ps1ued5frwbug39meq3a4oy",
      "publicKeyJwk": {
        "crv": "Ed25519",
        "kty": "OKP",
        "x": "i7EkNzq4TZVQkT_qQKfWqHOcttKaB7KSgZmz9aHZxqA",
        "kid": "Ca7pHOF9jtaQ61vuTSgWqZalEWIJJbeixVjfmS6mKOQ",
        "alg": "EdDSA"
      }
    }
  ],
  "authentication": [
    "did:dht:tqa1ep34zbg3kwrt89irbj6sib333ps1ued5frwbug39meq3a4oy#0"
  ],
  "assertionMethod": [
    "did:dht:tqa1ep34zbg3kwrt89irbj6sib333ps1ued5frwbug39meq3a4oy#0"
  ],
  "capabilityDelegation": [
    "did:dht:tqa1ep34zbg3kwrt89irbj6sib333ps1ued5frwbug39meq3a4oy#0"
  ],
  "capabilityInvocation": [
    "did:dht:tqa1ep34zbg3kwrt89irbj6sib333ps1ued5frwbug39meq3a4oy#0"
  ],
  "service": [
    {
      "id": "did:dht:tqa1ep34zbg3kwrt89irbj6sib333ps1ued5frwbug39meq3a4oy",
      "type": "DecentralizedWebNode",
      "serviceEndpoint": [
        "https://dwn.example.org/"
      ],
      "enc": "#enc",
      "sig": "#sig"
    }
  ]
}
```

### NPM Compatible

DWNPM leverages the existing `npm` cli tool to achieve all of this, eliminating the need for developers to adopt a whole new cli tool and new dev workflow.

**How does DWNPM highjack the NPM flow?***

On `npm install`, npm sees `@dwnpm` in `.npmrc` and redirects the GET requests from the default registry at `registry.npmjs.org` to a localhost registry server. Npm structures the request based on the left-hand-side name in the dependency object and forms a GET URL using it (e.g. `http://localhost:2092/@dwnpm/tool5~dhdsxf8w7rd36i5jx8hcpw8hkg1cg8sjhepm1n9iuj55zd3gpjdy`). The server routes are setup to capture this request, parse the path params and construct the needed info to find the DWN and fetch the package.

The method (or implied method) after name and before `~` is the network to use to lookup to specific id at the end of the `~`. If no method is passed, the local server assumes dht. Think of it as the method (e.g. `dht`) answers "in what general direction should I look?" (e.g. look in Atlanta, GA) and the id answers "where specifically in that direction should I look?" (look at 123 Main Street Apt 1, Atlanta GA 30308).

### Node.js Runtime (Register/Hooks)

The DWNPM register hooks paradigm can be used to run one-off scripts without downloading the DPK into the `node_modules` folder. Check out [hooks.ts](/src/lib/hooks.ts) and [register.ts](/src/lib/register.ts)

```shell
npm run build
node --import ./dist/esm/src/register.js ./path/to/your/script.js
```

## Tools

Below are sections outlining the tools included in this repo as part of DWNPM.

### Decentralized Web Node Package Explorer (DWNPX)

Coming Soon. DWNPX will be a listing service similar to npmjs.com where devs can create profiles with their DIDs and list their DWNPKs for discovery.

### Decentralized Web Node Package Registry (DWNPR)

DOCS COMING SOON! Check out [/registry](/src/registry) for code.

### Decentralized Web Node Package Manager (DWNPM)

See Issue [#39](https://github.com/bnonni/dwnpm.tools/issues/39).

### Decentralized Web Node Package Import (DWNPI)

DWNPIs are used to import code from locally installed DWNPKs

Example import

```ts
import express from '@dwnpm/express~8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo';
```

Example require

```js
const express = require('@dwnpm/express~8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo');
```

## ELI5 Vocabulary & Acronyms

Acronyms galore! But what does it all mean?

### Web5 Vocab

* DID = Decentralized Identifier
* DWN = Decentralized Web Node
* DWA = Decentralized Web App

### DWNPM Vocab

* DWNPR = Decentralized Web Node Package Registry
* DWNPK = Decentralized Web Node Package
* DWNPM = Decentralized Web Node Package Manager
* DWNPRM = Decentralized Web Node Package Registry Manager
* DWNPI = Decentralized Web Node Package Import

### Other Vocab

* NPK = Node Package
* NPM = Node Package Manager

## Project Resources

| Resource                                   | Description                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| [CODEOWNERS](./CODEOWNERS)                 | Outlines the project lead(s)                                                   |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Expected behavior for project contributors, promoting a welcoming environment |
| [CONTRIBUTING.md](./CONTRIBUTING.md)       | Developer guide to build, test, run, access CI, chat, discuss, file issues     |
| [GOVERNANCE.md](./GOVERNANCE.md)           | Project governance                                                             |
| [LICENSE](./LICENSE)                       | [![License: Unlicense][unlicense-badge]][unlicense-link]            |

[unlicense-badge]: https://img.shields.io/badge/License-Unlicense-blue.svg
[unlicense-link]: http://unlicense.org
