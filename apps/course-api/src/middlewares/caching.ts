import { NextFunction, Request, Response } from "express";
import { getRedisClient } from "@utils/redis_utils";

export default async function cacheEndpoint(req: Request, res: Response, next: NextFunction) {
	const endpoint = `${req.method} - ${req.originalUrl}`;

	if (req.method !== "GET") {
		console.log(`skipping cache middleware for unsupported method ${endpoint}`);
		return next();
	}

	const redisClient = await getRedisClient();
	const cachedResponse = await redisClient?.get(req.originalUrl);
	if (!cachedResponse) {
		console.log(`cache miss for endpoint: ${endpoint}, attempting to retrieve from database`);
		return next();
	}

	console.log(`cache hit for endpoint: ${endpoint}, returning cached data`);
	res.status(200).json(JSON.parse(cachedResponse));
}
