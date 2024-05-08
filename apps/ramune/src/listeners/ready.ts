import { ApplyOptions } from "@sapphire/decorators";
import { Listener, container } from "@sapphire/framework";
import type { StoreRegistryValue } from "@sapphire/pieces";
import { blue, gray, green, magenta, magentaBright, white, yellow } from "colorette";
import { startKafkaConsumer } from "../lib/kafka";
import { addReviewToCache, getReviewObjectFromMessage } from "../lib/review-utils";
import { SentReview } from "../lib/types/SentReview";

const dev = process.env.NODE_ENV !== "production";
declare module "@sapphire/pieces" {
	interface Container {
		reviewsSent: Map<string, SentReview>;
	}
}

@ApplyOptions<Listener.Options>({ once: true })
export class UserEvent extends Listener {
	private readonly style = dev ? yellow : blue;

	public override run() {
		this.printBanner();
		this.printStoreDebugInformation();
		this.initReviewStore();
	}

	private printBanner() {
		const success = green("+");

		const llc = dev ? magentaBright : white;
		const blc = dev ? magenta : blue;

		const line01 = llc("");
		const line02 = llc("");
		const line03 = llc("");

		// Offset Pad
		const pad = " ".repeat(7);

		console.log(
			String.raw`
${line01} ${pad}${blc("1.0.0")}
${line02} ${pad}[${success}] Gateway
${line03}${dev ? ` ${pad}${blc("<")}${llc("/")}${blc(">")} ${llc("DEVELOPMENT MODE")}` : ""}
		`.trim()
		);
	}

	private printStoreDebugInformation() {
		const { client, logger } = this.container;
		const stores = [...client.stores.values()];
		const last = stores.pop()!;

		for (const store of stores) logger.info(this.styleStore(store, false));
		logger.info(this.styleStore(last, true));
	}

	private styleStore(store: StoreRegistryValue, last: boolean) {
		return gray(`${last ? "└─" : "├─"} Loaded ${this.style(store.size.toString().padEnd(3, " "))} ${store.name}.`);
	}

	private async initReviewStore() {
		await this.getReviewsInReviewChannelAndSetReviewsSent();
		await this.startKafkaConsumerWhenBotIsReady();
	}

	private async startKafkaConsumerWhenBotIsReady() {
		await startKafkaConsumer();
	}

	private async getReviewsInReviewChannelAndSetReviewsSent() {
		container.reviewsSent = new Map<string, SentReview>();

		const reviewChannel = await container.client.channels.fetch(process.env.REVIEW_CHANNEL_ID!);

		if (!reviewChannel || !reviewChannel.isTextBased()) {
			container.logger.error("Review channel not found.");
			// await interaction.reply("Review channel not found.");
			return;
		}

		const reviewChannelMessages = await reviewChannel.messages.fetch({
			limit: 50
		});

		if (reviewChannelMessages.size === 0) {
			container.logger.error("Review channel is empty.");
			// await interaction.reply("Review channel is empty.");
			return;
		}

		reviewChannelMessages.forEach((message) => {
			if (!message.author.bot) return;

			const reviewObjectFromMessage = getReviewObjectFromMessage(message);

			// null means that the message is not a review message, or something was broken
			// TODO: proper checks for this
			if (!reviewObjectFromMessage) return;

			// TODO: extract this logic into a function.. and also properly handle errors, nulls, whatever
			// TODO: probably not use destructuring here
			const { reviewId, courseCode, rating, reviewDescription, submittedDate } = reviewObjectFromMessage;

			if (!reviewId || !courseCode || !rating || !reviewDescription || !submittedDate) {
				container.logger.warn("Review object is missing fields:", message.toJSON());
				return;
			}

			addReviewToCache(reviewId, {
				review: {
					reviewId: reviewId,
					courseCode: courseCode,
					rating,
					reviewDescription,
					submittedDate: new Date(submittedDate)
				},
				boundMessage: message
			});
		});
	}
}
