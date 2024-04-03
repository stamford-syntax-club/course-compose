import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { PermissionFlagsBits } from "discord.js";
import { sendReviewToReviewsChannel } from "../lib/send-review-to-reviews-channel";

@ApplyOptions<Command.Options>({
	name: "test-create-review",
	description: "Test creating a review, sending it to the reviews channel"
})
export class TestCreateReviewCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder // This comment is here to stop prettier from formatting the builder
				.setName(this.name)
				.setDescription(this.description)
				.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await sendReviewToReviewsChannel({
			reviewId: "123",
			courseCode: "CSC123",
			rating: 4.5,
			reviewDescription: "This is a test review."
		});

		await interaction.reply("Test review created:");
	}
}
