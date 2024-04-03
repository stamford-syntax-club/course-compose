import { InteractionHandler, InteractionHandlerTypes, container } from "@sapphire/framework";
import type { ModalSubmitInteraction } from "discord.js";
import { getMemberMention, getReviewIdAndCourseCodeFromOriginalMessage } from "../lib/review-utils";

export class ModalHandler extends InteractionHandler {
	public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.ModalSubmit
		});
	}

	public override parse(interaction: ModalSubmitInteraction) {
		return interaction.customId === "reject_review_modal_submit" ? this.some() : this.none();
	}

	public async run(interaction: ModalSubmitInteraction) {
		const originalMessage = interaction.message;

		const { reviewId, courseCode } = getReviewIdAndCourseCodeFromOriginalMessage(originalMessage) ?? {};

		if (!originalMessage || !reviewId || !courseCode) {
			container.logger.error("originalMessage, reviewId or courseCode is missing:", interaction.toJSON());

			await interaction.reply({
				content: "reviewId or courseCode is missing.",
				ephemeral: true
			});

			return;
		}

		const rejectReason = interaction.fields.getTextInputValue("rejectReasonInput");

		if (!rejectReason) {
			container.logger.error("rejectReason is missing:", interaction.toJSON());

			await interaction.reply({
				content: "You must provide a reason for rejecting the review.",
				ephemeral: true
			});

			return;
		}

		const cleanedRejectReason = rejectReason.trim().replaceAll("`", "\\`");
		const memberMention = getMemberMention(interaction.member);

		await originalMessage.delete();
		await interaction.reply({
			content: `Review \`#${reviewId}\` for course \`${courseCode}\` rejected by ${memberMention} for reason: \`\`\`${cleanedRejectReason}\`\`\``
		});
	}
}
