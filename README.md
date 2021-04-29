# Wikishape

React web client for [RDFShape API](https://github.com/weso/rdfshape-api) used to operate the API in a human-friendly way. Differs from [RDFShape Client](https://github.com/weso/rdfshape-client): it is more limited and for operating Wikidata and Wikibase instances.

It also features software from [WESO](https://www.weso.es) such as [sheXer](https://github.com/DaniFdezAlvarez/shexer).


[![Continuous Integration](https://github.com/weso/rdfshape-client/actions/workflows/build_test.yml/badge.svg)](https://github.com/weso/wikishape/actions/workflows/build_test.yml)
[![Docker build](https://github.com/weso/rdfshape-client/actions/workflows/publish_docker.yml/badge.svg)](https://github.com/weso/wikishape/actions/workflows/publish_docker.yml)


# Deployed versions of Wikishape

This client is already deployed [here](http://wikishape.weso.es/).

# Quick reference

- Maintained by: [WESO Research Group](https://weso.es)
- Wikibase project: https://wikiba.se/
- SheXer: http://shexer.weso.es/

# Installation

## Deploy locally
### Steps
1. Clone this repository
2. Go to directory where RDFShape Client source code is located
3. Install dependencies via `npm install`
4. Start a development server via `npm start`
5. When ready, build the app for production with `npm run build`. The ouput will be located in the _build_ folder

This app was bootstrapped via Create React App, refer to [their website](https://create-react-app.dev/) to learn more.

## Deploy with Docker
* Use the provided Dockerfile to build rdfshape or pull from [Github Container Registry](https://github.com/orgs/weso/packages/container/package/wikishape).

### Building the image
* No build arguments are required. The client will be exposed on container 80 of the future containers.

### Running containers
* When running a container, you may provide the following environment variables
  via `--env`:
    * **RDFSHAPE_HOST** [optional]: Location where this client will look for the RDFShape API. Defaults to our current deployment at https://rdfshape.weso.es:8080.
    * **SHEXER_HOST** [optional]: Location where this client will look for the sheXer API. Defaults to our current deployment at http://156.35.94.158:8081/shexer.

### Supported tags
- _:stable_: Stable build updated manually.
- <_:hashed_tags_>: Automated builds by our CI pipeline. With the latest features uploaded to our repository but lacking internal testing.


# Contribution and issues

Contributions are greatly appreciated. Please fork this repository and open a pull request to add more features or submit issues:

* [Issues about Wikishape](https://github.com/weso/wikishape/issues)

<a href="https://github.com/weso/wikishape/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=weso/wikishape" />
</a>


