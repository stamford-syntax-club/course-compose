import { createClient } from "redis";

const redisClient = createClient({
	url: process.env.REDIS_URL
});

process.on("exit", async () => {
	console.log("exiting redis..");
	await redisClient.disconnect();
	console.log("redis exited");
});

export async function getRedisClient() {
	if (redisClient.isReady && redisClient.isOpen) {
		return redisClient;
	}

	try {
		await redisClient.connect();
		return redisClient;
	} catch (error) {
		console.log("error connecting to redis:", error);
		await redisClient.disconnect();
		return null;
	}
}
