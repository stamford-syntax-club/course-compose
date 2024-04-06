import { InteractionHandler, InteractionHandlerTypes, container } from "@sapphire/framework";
import { type ButtonInteraction } from "discord.js";
import {
	approveReview,
	deleteReviewFromCache,
	getMemberMention,
	getReviewObjectFromMessage
} from "../lib/review-utils";

export class ApproveReviewButtonHandler extends InteractionHandler {
	public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.Button
		});
	}

	public override parse(interaction: ButtonInteraction) {
		return interaction.customId === "approve_review_button" ? this.some() : this.none();
	}

	public async run(interaction: ButtonInteraction) {
		const originalMessage = interaction.message;

		const firstEmbedTitle = originalMessage.embeds[0].title;
		if (!firstEmbedTitle) {
			container.logger.error("No title found in the first embed of the message.");
			await interaction.reply({
				content: "An error occurred while trying to approve the review.",
				ephemeral: true
			});
			return;
		}

		const { reviewId, courseCode, reviewDescription } = getReviewObjectFromMessage(originalMessage) ?? {};

		if (!originalMessage || !reviewId || !courseCode) {
			container.logger.error("originalMessage, reviewId or courseCode is missing:", interaction.toJSON());

			await interaction.reply({
				content: "reviewId or courseCode is missing.",
				ephemeral: true
			});

			return;
		}

		const { err } = await approveReview(reviewId);

		if (err) {
			await interaction.reply({
				content: `An error occurred while trying to approve the review: ${err.message}`,
				ephemeral: true
			});

			return;
		}

		let memberMention = getMemberMention(interaction.member);

		await originalMessage.delete();
		await interaction.reply({
			content: `Review \`#${reviewId}\` for course \`${courseCode}\` accepted by ${memberMention}\n\nReview Message: ${reviewDescription}`
		});

		deleteReviewFromCache(reviewId);
		container.logger.info("Review approved:", reviewId);
	}
}
