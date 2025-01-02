# Release Current

A SASS product that allows Organisations to manage the "release" of versions of their own SASS products. It will show an overview of their releases and handle the lifecycle from the completion of development through QA all the way to deployment and completion.

It will assist in bringing various teams together, allowing for seamless collaboration.

## Structure

- Oraganisations (orgs) - The overacting entity. Organisation will have "projects" and "users" tied to this organisation.

- Users - The entity that logs in, they can be ties to multiple orgs

- Projects - Tied to a particular org, projects are likely an app or part of a SASS stack. (mobile and api) could both be projects. Projects will have a particular config with such things as "repositories" and "dependencies" and they will also own the releases or versions (which may be a better name).

- Versions - Tied to the projects these will be the thing managed across lifecycle's and will be "released". Versions will have "issues" (for want of a better term) that will need to be tracked and tested etc. Versions will also have additional info such as deployment check-lists for multiple deployments across different environments and release notes plus more maybe...


