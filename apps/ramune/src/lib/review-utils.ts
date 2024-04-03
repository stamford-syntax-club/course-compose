import { APIInteractionGuildMember, GuildMember, Message, userMention } from "discord.js";

export function getReviewIdAndCourseCodeFromOriginalMessage(originalMessage: Message<boolean> | null) {
	if (!originalMessage) {
		return null;
	}

	const firstEmbedTitle = originalMessage.embeds[0].title;
	if (!firstEmbedTitle) {
		return null;
	}

	const reviewId = firstEmbedTitle.split(" ")[1].replace("#", "");
	const courseCode = firstEmbedTitle.split(" ")[2].replace("(", "").replace(")", "");

	return { reviewId, courseCode };
}

export function getMemberMention(member: GuildMember | APIInteractionGuildMember | null) {
	return member ? userMention(member.user?.id) : "UNKNOWN";
}
