import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";

@ApplyOptions<Command.Options>({
	name: "echo",
	description: "Echoes the message back to the user"
})
export class EchoCommand extends Command {
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
				.addStringOption((option) =>
					option.setName("text").setDescription("The text to echo back").setRequired(true)
				)
		);
	}

	public override chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return interaction.reply(interaction.options.getString("text") ?? "No text provided.");
	}
}
