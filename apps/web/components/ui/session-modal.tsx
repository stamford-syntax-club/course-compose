import { Text, Title, Modal, Button } from "@mantine/core";
import { useAuth } from "hooks/use-auth";

interface SessionModalProps {
	opened: boolean;
	open: () => void;
	close: () => void;
}

export default function SessionModal({ opened, close }: SessionModalProps): JSX.Element {
	const { signIn } = useAuth();

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
						signIn().catch(console.error);
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
