interface Guideline {
	title: string;
	rules?: string[];
}

interface Aspect {
	title: string;
	info: string;
}

export const guideline: Guideline[] = [
	{
		title: "Be Honest and Constructive",
		rules: [
			"Share your genuine experience and opinions about the course by providing constructive criticism and avoiding using offensive language.",
			"Remember that your review is subjective and based on your experience. Other students may have different opinions and experiences. Please do not consider any single review as the main reason to enroll in or avoid a course"
		]
	},
	{
		title: "Advice for Future Students",
		rules: [
			"Offer tips or advice for students considering taking the course. For example, how to prepare for the course or what to expect",
			"Use specific examples to illustrate your points. For instance, mention particular assignments, projects, or teaching methods that stood out"
		]
	},
	{
		title: "Be Respectful and Fair",
		rules: [
			"Write your review respectfully and avoid personal attacks on instructors or classmates.",
			"Provide balanced feedback, mentioning both positives and areas for improvement.",
			"Ensure your review does not encourage or suggest academic dishonesty. Respect the academic policies of your institution.",
			"Avoid mentioning the names of individuals in your review unless it is to admire or positively acknowledge their contribution"
		]
	},
	{
		title: "Keep it Relevant",
		rules: [
			"Focus on aspects directly related to the course and its delivery.",
			"Avoid discussing unrelated personal grievances or issues outside the scope of the course."
		]
	}
];

export const aspects: Aspect[] = [
	{
		title: "Course Content",
		info: "Describe the quality and relevance of the course materials."
	},
	{
		title: "Teaching Quality",
		info: "Comment on the instructor's teaching style and effectiveness without mentioning their name."
	},
	{
		title: "Workload",
		info: "Mention the amount of work required, including assignments, projects, and exams."
	},
	{
		title: "Practical Application",
		info: "Discuss how the course content applies to real-world scenarios or your field of study."
	},
	{
		title: "Resources and Support",
		info: "Note the availability and usefulness of resources such as textbooks, online materials, and support from teaching assistants."
	}
];
