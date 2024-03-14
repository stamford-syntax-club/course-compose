export interface Review {
	id: number;
	academicYear: string;
	description: string;
	isOwner: boolean;
	rating: number;
	status: string;
    rejectedReason: string;
	votes: number;
	course: { id: number; code: string };
	profile: { id: string };
	created_at: Date;
}
