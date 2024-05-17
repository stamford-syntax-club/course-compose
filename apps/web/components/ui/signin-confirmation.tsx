import { Alert, Button, Divider, Flex, Group, Modal, Text, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useAuth } from "hooks/use-auth";

export default function SigninConfirmationModal({ opened, close }: { opened: boolean; close: () => void }) {
	const { signIn, working } = useAuth();

	return (
		<Modal
			opened={opened}
			onClose={close}
			title={<Title order={3}>Signing in to Course Compose</Title>}
			size="auto"
		>
			<Flex direction="column" gap="lg" align="center" maw={500}>
				<Alert icon={<IconAlertCircle />}>
					Please read the following to if you have any concerns regarding the use of your Stamford accounts
				</Alert>

				<Text ta="center">
					By signing in, you will be redirected to the Microsoft login Page which <b>automatically</b>{" "}
					retrieves your recent sessions. This process is solely to confirm your status as a Stamford student.
				</Text>
				<Text ta="center" fs="italic">
					We, Stamford Syntax Club, <b>do not have</b> access to your credentials
				</Text>
				<Group>
					<Button disabled={working} onClick={signIn}>
						Sign In
					</Button>
					<Button variant="transparent" onClick={close}>
						No, take me back
					</Button>
				</Group>
			</Flex>
		</Modal>
	);
}
