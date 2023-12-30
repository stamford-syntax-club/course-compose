"use client";

import fetcher from "@utils/fetcher";
import useSWR from "swr";

interface ResourceFile {
	name: string;
	url: string;
}

interface ResourceCategory {
	files: ResourceFile[];
	iconURL: string;
	name: string;
}

type ResourceData = ResourceCategory[];

export default function HomePage(): JSX.Element {
	const { data, error, isLoading } = useSWR<ResourceData, Error>("http://localhost:8000/api/courses", fetcher);

	return (
		<div>
			<h1>Course Compose</h1>
			<p>Course Review Website by Stamford Syntax Club</p>

			{isLoading ? <p>Loading...</p> : null}

			{!error && data ? (
				data.map((course) => (
					<li key={course.name}>
						<h2>{course.name}</h2>
						<img alt="Some" src={course.iconURL} />
						<ul>
							{course.files.map((file) => (
								<li key={file.name}>
									<a href={file.url}>{file.name}</a>
								</li>
							))}
						</ul>
					</li>
				))
			) : (
				<p>Error: {error?.message}</p>
			)}
		</div>
	);
}
