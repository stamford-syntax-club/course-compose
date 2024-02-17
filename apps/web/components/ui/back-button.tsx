import Link from "next/link";
import { Button } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";

export default function BackButton({ href, pageName }: { href: string; pageName: string }) {
	return (
		<Link href={href}>
			<Button variant="subtle" leftSection={<IconChevronLeft size={15} />}>
				Back to {pageName}
			</Button>
		</Link>
	);
}
