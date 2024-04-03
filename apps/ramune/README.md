# Ramune + Sapphire 🚀

This is the bot that sends a message to the channel when a review is submitted on the [CourseCompose](https://github.com/stamford-syntax-club/course-compose) website. 
It will read a Kafka topic and send a message to the channel when a review is submitted. 📣

Built using the [Sapphire framework](https://github.com/sapphiredev/framework) and TypeScript.

## Getting Started 🛠

### Prerequisites 📋

Before diving in, make sure you have [Bun](https://bun.sh/) on your machine. Not sure how? Follow the [installation guide](https://bun.sh/docs/installation) to get set up.

Next up, clone the repository to your local environment. To install all necessary dependencies, simply run:
```sh
bun install
```

### Development Setup 🖥

To run our bot for development, use:
```sh
bun run dev
```
Alternatively, `bun run watch:start` will watch for file changes, restarting the bot automatically when something is changed. However, to avoid rate limits, sticking to `bun run dev` is recommended.

### Shifting to Production 🚀

Switch to production mode by setting `NODE_ENV=production` in your environment file.

Start the building process with:
```sh
bun run build
```
Once built, run the bot using:
```sh
node dist/index.js
```
Note: For production, we bypass Bun's runtime due to its growing pains and limitations. It's an area under improvement but for now, this workaround keeps us moving forward, especially on Windows environments.

## License 📜

Embracing open-source spirit, **Ramune + Sapphire** is generously dedicated to the public domain under the [Unlicense](https://github.com/sapphiredev/examples/blob/main/LICENSE.md).