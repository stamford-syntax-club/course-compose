import { InteractionHandler, InteractionHandlerTypes, container } from "@sapphire/framework";
import { type ButtonInteraction } from "discord.js";
import { getMemberMention } from "../lib/review-utils";

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

		const reviewId = firstEmbedTitle.split(" ")[1].replace("#", "");
		const courseCode = firstEmbedTitle.split(" ")[2].replace("(", "").replace(")", "");

		let memberMention = getMemberMention(interaction.member);

		await originalMessage.delete();
		await interaction.reply({
			content: `Review \`#${reviewId}\` for course \`${courseCode}\` approved by ${memberMention}`
		});
	}
}
