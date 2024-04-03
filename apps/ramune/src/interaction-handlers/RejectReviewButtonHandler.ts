import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import {
	ActionRowBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	type ButtonInteraction
} from "discord.js";

export class ApproveReviewButtonHandler extends InteractionHandler {
	public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.Button
		});
	}

	public override parse(interaction: ButtonInteraction) {
		return interaction.customId === "reject_review_button" ? this.some() : this.none();
	}

	public async run(interaction: ButtonInteraction) {
		const rejectReasonInput = new TextInputBuilder()
			.setCustomId("rejectReasonInput")
			.setLabel("Rejection Reason") // Label is a **required** field, otherwise, ValidationError > s.string, Expected a string primitive
			.setMinLength(10)
			.setMaxLength(280) // Same as the maximum length of a tweet.. for no reason.
			.setPlaceholder("Your review did not meet the quality standards.")
			.setStyle(TextInputStyle.Short);

		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(rejectReasonInput);

		const rejectReviewModal = new ModalBuilder()
			.setTitle("Provide a rejection reason")
			.setCustomId("reject_review_modal_submit")
			.addComponents(row);

		await interaction.showModal(rejectReviewModal);
	}
}
