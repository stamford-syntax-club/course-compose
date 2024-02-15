import Link from "next/link";
import { Button } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";

export default function LinkButton({ where }: { where: string }) {
	return (
		<Link href={where}>
			<Button variant="subtle" leftSection={<IconChevronLeft size={15} />}>
				Back
			</Button>
		</Link>
	);
}
