import { createClient } from "redis";

const redisClient = createClient({
  socket: {
    host: process.env.HOST,
    port: 6379,
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

await redisClient.connect();

export default redisClient;
