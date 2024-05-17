import { Alert, Button, Flex, Group, Modal, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useAuth } from "hooks/use-auth";
import { useRouter } from "next/navigation";

export default function SigninConfirmationModal({
	opened,
	close
}: {
	opened: boolean;
	close: () => void;
}): JSX.Element {
	const { signIn, working } = useAuth();
	const router = useRouter();

	return (
		<Modal opened={opened} onClose={close} title="Signing in to Course Compose" size="auto">
			<Flex direction="column" gap="lg" align="center" maw={500}>
				<Alert icon={<IconAlertCircle />}>
					Please read the following to if you have any concerns regarding the use of your Stamford accounts
				</Alert>

				<Text ta="center">
					By signing in, you will be redirected to the Microsoft login Page which <b>automatically</b>{" "}
					retrieves your recent sessions. This process is solely to confirm your status as a Stamford student.
				</Text>
				<Text ta="center" fs="italic">
					We, the Stamford Syntax Club, <b>cannot</b> access your credentials
				</Text>
				<Group>
					<Button
						disabled={working}
						onClick={() => {
							if (process.env.NEXT_PUBLIC_APP_ENV === "production") signIn().catch(console.error);
							else {
								router.push("/sign-in");
								close();
							}
						}}
					>
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
