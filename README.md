# wikishape

Wikidata and wikibase description and validation tool using shapes.

This is a [React](https://reactjs.org/) application currently deployed at [http://wikishape.weso.es/](http://wikishape.weso.es/).

## Deploy with Docker
This React application can be launched as a Docker container.

* Use the provided Dockerfile to build rdfshape or pull from [Docker Hub](https://hub.docker.com/r/wesogroup/wikishape).
* When launching containers from the image, you may provide the following environment variables via `--env`:
    * **RDFSHAPE_HOST**: Location where this client will look for the RDFShape backend. Defaults to our current deployment at https://rdfshape.weso.es:8080.
    * **SHEXER_HOST**: Location where this client will look for the [Shexer](http://shexer.weso.es/) web service. Defaults to our current deployment at http://156.35.94.158:8081/shexer.

