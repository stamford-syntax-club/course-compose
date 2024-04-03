import { User } from "@models/user.model";
import prismaClient from "@utils/prisma_utils";

export const getUser = async (userId: string | undefined): Promise<User | null> => {
	if (!userId) return null;

	const user = await prismaClient.profile.findUnique({
		where: {
			id: userId
		}
	});

	return user;
};
