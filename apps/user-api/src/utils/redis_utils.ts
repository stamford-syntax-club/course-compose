import { createClient } from "redis";

const redisClient = createClient({
	url: process.env.REDIS_URL
});

if (process.env.APP_ENV === "beta" || process.env.APP_ENV === "prod") {
	process.on("exit", async () => {
		console.log("exiting redis..");
		try {
			redisClient.disconnect();
		} catch (error) {
			console.error("error exiting redis:", error);
		}
	});
}

export async function getRedisClient() {
	if (redisClient.isReady && redisClient.isOpen) {
		return redisClient;
	}

	try {
		await redisClient.connect();
		return redisClient;
	} catch (error) {
		console.error("error connecting to redis:", error);
		return null;
	}
}
