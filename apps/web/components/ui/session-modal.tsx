import { Text, Title, Modal, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useEffect } from "react";

export default function SessionModal({ supabase }: { supabase: SupabaseClient<any, "public", any> }) {
	const [opened, { open, close }] = useDisclosure(false);

	useEffect(() => {
		open();
	}, []);

	return (
		<Modal
			opened={opened}
			onClose={close}
			overlayProps={{
				backgroundOpacity: 0.65,
				blur: 3
			}}
			centered
			withCloseButton={false}
		>
			<div className="text-center">
				<Title my="sm" order={3}>
					You are not logged in
				</Title>
				<Text>Verified users get to read as many reviews as they want and can also write their own.</Text>
				<Button
					my="md"
					onClick={() => {
						supabase.auth
							.signInWithOAuth({
								provider: "azure",
								options: { redirectTo: window.location.href }
							})
							.then((result) => {
								console.log("OAuth result", result.data);
							})
							.catch((error) => {
								console.error(error);
							});
					}}
				>
					Login with your Stamford account
				</Button>
				<Text>or</Text>
				<Button mt="md" variant="transparent" onClick={close}>
					Continue as guest
				</Button>
			</div>
		</Modal>
	);
}
