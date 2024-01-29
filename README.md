# Course Compose

## Overview

Course Compose is a course-review website tailored for Stamford students, providing a platform for sharing and discovering insights about various courses. Similar to Glassdoor, Course Compose aims to offer a transparent and informative space where students can review and rate their courses.

## Project Structure

The project follows a NextJS Turbo Repo architecture, with the backend comprised of microservices implemented in Typescript and Golang.

## Getting Started

1. Install dependencies: 
```bash
pnpm install
```

2. Make sure that [Docker](https://www.docker.com/get-started/) is installed

3. Bootstrap project for development 
```bash
pnpm run bootstrap:unix // for Unix-based systems
pnpm run bootstrap:windows // for Windows
// Why? See, the environment variables are not properly kept in the context of the execution of the command on Windows, which means we have to work around that.
```

4. Start a local development server
```bash
pnpm run dev
```

