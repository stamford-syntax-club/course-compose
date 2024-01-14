import { RequestHandler } from "express";
import basicAuth from "express-basic-auth";

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

export default function adminAuth(): RequestHandler {
	if (!username || !password) {
		throw new Error("Missing admin username or password");
	}

	return basicAuth({
		authorizer: (usernameInput: string, passwordInput: string) => {
			const userMatches = basicAuth.safeCompare(usernameInput, username);
			const passwdMatches = basicAuth.safeCompare(passwordInput, password);
			return userMatches && passwdMatches;
		},
		unauthorizedResponse: { status: "Invalid Admin Credentials" }
	});
}
