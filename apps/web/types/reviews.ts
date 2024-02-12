export interface Review {
	id: number;
	academicYear: number;
	description: string;
	isOwner: boolean;
	rating: number;
	status: string;
	votes: number;
	course: { id: number; code: string };
	profile: { id: string };
	created_at: Date;
}
