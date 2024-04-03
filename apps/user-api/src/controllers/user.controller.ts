import { Request } from "express-jwt";
import { Response } from "express";
import { getUser } from "@services/user.service";

const handleGetUser = async (req: Request, res: Response) => {
	try {
		const user = await getUser(req.auth?.sub);
		if (!user) {
			return res.status(400).json({
				message: "User not logged in"
			});
		}

		res.status(200).json(user);
	} catch (error) {
		console.log("Error: ", error);
		res.status(500).json({
			message: "Internal server error"
		});
	}
};

export { handleGetUser };
