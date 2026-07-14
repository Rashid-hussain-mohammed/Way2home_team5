# About this folder
This folder currently contains GitHub automations for this project.


## Actions
Actions are sets of commands or other actions that do various things.

The actions in this repository do the following:

### Build node
Builds a node application as denoted by the `service-name` input parameter. This should be the same as the folder name.

### Build and deploy node
Executes the build action, moves the build result from the `dist` folder onto the server and restarts the service via SSH.

This obviously requires the server to be setup already.


## Workflows
Workflows are the actual jobs we want to run.

They consist of a trigger (listed under `on`) and jobs.

For every job, we can define an environment where the job should be run (`ubuntu-latest`) by default.

The `test-backend.yml` workflow for example will run for every push to the `main` branch that changes a file in the `backend` folder.
It first downloads the current version of the code and then executes the *Build and deploy node* action defined above.
