import { RequestHandler } from "express";
import basicAuth from "express-basic-auth";

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

export default function adminAuth(): RequestHandler {
	if (!username || !password) {
		throw new Error("Missing admin username or password");
	}

	return basicAuth({
		users: {
			username: password
		},
		unauthorizedResponse: { status: "Invalid Admin Credentials" }
	});
}
