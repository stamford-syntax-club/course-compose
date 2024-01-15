const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");
require("dotenv").config({ path: ".env.test" });

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: "<rootDir>"
	}),
	testPathIgnorePatterns: ["/lib/", "/node_modules/", "/img/", "/dist/"],
	preset: "ts-jest",
	testEnvironment: "node"
};
