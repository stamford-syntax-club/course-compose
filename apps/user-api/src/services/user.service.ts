import prismaClient from "@utils/prisma_utils";

export const getUser = async (userId: string | undefined) => {
    if (!userId) return null

	const user = await prismaClient.profile.findUnique({
		where: {
			id: userId
		}
	});

	return user;
};
