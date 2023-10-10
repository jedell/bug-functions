# bug-functions

This project, named bug-functions, is a set of [Supabase Edge Functions](https://supabase.com/docs/guides/functions) written in Node.js Deno, and TypeScript. It is designed to handle various backend tasks for the Bug application.

## Table of Contents

- [Project Structure](#project-structure)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [1. Follow these instructions to setup Supabase on your local machine.](#1-follow-these-instructions-to-setup-supabase-on-your-local-machine)
  - [2. Retrieve .env file and place it in the supabase folder.](#2-retrieve-env-file-and-place-it-in-the-supabase-folder)
  - [3. Run the following command to start the server:](#3-run-the-following-command-to-start-the-server)
- [Helpful Supabase CLI Commands](#helpful-supabase-cli-commands)
  - [1. Create a new function:](#1-create-a-new-function)
  - [2. Start Supabase container:](#2-start-supabase-container)
  - [3. Stop Supabase container:](#3-stop-supabase-container)
  - [4. Serve functions locally:](#4-serve-functions-locally)
- [Testing](#testing)

## Project Structure

The project follows the Supabse Edge Functions project structure. 

1. project-root: This is the root directory of the project. It contains configuration files for TypeScript, VSCode, and the workspace. It also contains the main README file.

2. supabase: This directory contains the Supabase configuration and function files. It is further divided into functions and config.toml file. The functions directory contains the server-side functions that are served by Supabase.

3. supabase/functions: This directory contains the server-side functions that are served by Supabase. Each function is contained in its own directory. Each function directory contains a function file, a package.json file, and a tsconfig.json file. The function file contains the code for the function. The package.json file contains the dependencies for the function. The tsconfig.json file contains the TypeScript configuration for the function.


## Setup

### Prerequisites:

- [Node.js](https://nodejs.org/en/download/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Docker](https://docs.docker.com/get-docker/)
- [Deno](https://deno.land/manual/getting_started/installation)

#### 1. Follow [these instructions](https://supabase.com/docs/guides/functions/quickstart) to setup Supabase on your local machine.

#### 2. Retrieve .env file and place it in the supabase folder.

#### 3. Run the following command to start the server:

```bash
supabase functions serve --debug --env-file ./supabase/.env
```

## Helpful Supabase CLI Commands

### 1. Create a new function:

```bash
supabase functions new <function_name>
```

### 2. Start Supabase container:

```bash
supabase start
```

### 3. Stop Supabase container:

```bash
supabase stop
```

### 4. Serve functions locally:

```bash
supabase functions serve --debug --env-file ./supabase/.env
```

## Testing

Follow this [guide](https://supabase.com/docs/guides/functions/unit-test) to setup unit testing for Supabase Edge Functions.

### Running Tests:

```bash
# Start Supabase container and serve functions locally
supabase start
supabase functions serve --debug --env-file ./supabase/.env

# Run tests
deno test --allow-all deno-test.ts --env-file .env.local

# Stop Supabase container
supabase stop
```

### Unit Testing vs Integration Testing
