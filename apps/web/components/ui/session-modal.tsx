import { Text, Title, Modal, Button } from "@mantine/core";
import { useSupabaseStore } from "@stores/supabase-store";

interface SessionModalProps {
	opened: boolean;
	open: () => void;
	close: () => void;
}

export default function SessionModal({ opened, open, close }: SessionModalProps) {
	const { supabase } = useSupabaseStore();

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
						supabase?.auth
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
