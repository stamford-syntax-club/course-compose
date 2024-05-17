"use client";

import { useToggle } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { TextInput, PasswordInput, Text, Paper, Group, Button, Divider, Anchor, Stack, Alert } from "@mantine/core";
import { useAuth } from "hooks/use-auth";
import { useRouter } from "next/navigation";
import { IconInfoCircle } from "@tabler/icons-react";

enum mode {
	LOGIN,
	REGISTER
}

export default function SigninPage() {
	const [authMode, switchAuthMode] = useToggle([mode.LOGIN, mode.REGISTER]);
	const { signIn, signUp } = useAuth();
	const form = useForm({
		mode: "uncontrolled",
		initialValues: {
			email: "",
			password: ""
		},
		validate: {
			email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
			password: (val) => (val.length < 6 ? "Password should include at least 6 characters" : null)
		}
	});
	const { push } = useRouter();

	return (
		<div className="flex h-full items-center justify-center">
			<Paper p="lg" withBorder className=" w-full max-w-xl">
				<Text size="xl" ta="center" fw={500} mb="lg">
					{authMode === mode.REGISTER ? "Create new account" : "Welcome to Course Compose"}
				</Text>

				<Divider labelPosition="center" my="lg" />

				<form
					onSubmit={form.onSubmit((values) => {
						if (authMode === mode.REGISTER) {
							signUp(values.email, values.password);
						} else if (authMode === mode.LOGIN) {
							signIn(values.email, values.password);
							push("/");
						}
					})}
				>
					<Stack>
						{authMode === mode.REGISTER && (
							<Alert icon={<IconInfoCircle />}>Check your mail inbox to confirm your registration</Alert>
						)}

						<TextInput
							withAsterisk
							label="Stamford Email"
							placeholder="xxxxxxx@students.stamford.edu"
							key={form.key("email")}
							{...form.getInputProps("email")}
							radius="lg"
							size="lg"
						/>

						<PasswordInput
							withAsterisk
							label="Password"
							placeholder="Your password"
							key={form.key("password")}
							{...form.getInputProps("password")}
							radius="lg"
							size="lg"
						/>
					</Stack>

					<Group justify="space-between" mt="xl">
						<Anchor
							component="button"
							type="button"
							c="dimmed"
							onClick={() => {
								switchAuthMode();
							}}
							size="md"
						>
							{authMode === mode.REGISTER
								? "Already have an account? Login"
								: "Don't have an account? Register"}
						</Anchor>
						<Button type="submit">{authMode === mode.REGISTER ? "Sign Up" : "Sign In"}</Button>
					</Group>
				</form>
			</Paper>
		</div>
	);
}
