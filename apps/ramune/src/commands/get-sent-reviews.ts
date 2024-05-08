import { ApplyOptions } from "@sapphire/decorators";
import { Command, container } from "@sapphire/framework";

@ApplyOptions<Command.Options>({
	description: "Gets the sent commands stored in the bot's memory"
})
export class GetSentReviewsCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return interaction.reply({
			content: `Current IDs in reviewsSent: ${Array.from(container.reviewsSent.keys()).join(", ") || "None"}`
		});
	}
}
