import { Message } from "discord.js";
import { ReviewType } from "./ReviewType";

export interface SentReview {
	boundMessage: Message<boolean>;
	review: ReviewType;
}
