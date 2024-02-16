import { Text, Title, Modal, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AUTH_TOKEN_KEY } from "@utils/constants";
import { useEffect } from "react";
import Link from "next/link";

export default function SessionModal({ onCloseCallBack }: { onCloseCallBack: () => void }) {
	const [opened, { open, close }] = useDisclosure(false);

	useEffect(() => {
		open();
	}, []);

	const closeModal = () => {
		// TODO: this essentially force remove all the stored token when close the modal, do some logic here after new token is retrieved
		localStorage.setItem(AUTH_TOKEN_KEY, "");
		onCloseCallBack();
		close();
	};

	return (
		<Modal
			opened={opened}
			onClose={() => closeModal()}
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
				<Link href={" TODO: redirect to auth page "}>
					<Button c="blue" my="md">
						Login with your Stamford account
					</Button>
				</Link>
				<Text>or</Text>
				<Button mt="md" onClick={(e) => closeModal()}>
					Continue as guest
				</Button>
			</div>
		</Modal>
	);
}
