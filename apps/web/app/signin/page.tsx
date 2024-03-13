"use client";

import { useState } from 'react'; // Import useState hook
import { useToggle, upperFirst } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
    TextInput,
    PasswordInput,
    Text,
    Paper,
    Group,
    PaperProps,
    Button,
    Divider,
    Checkbox,
    Anchor,
    Stack,
} from '@mantine/core';

export default function SigninPage(props: PaperProps) {
    const [type, toggle] = useToggle(['login', 'register']);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const form = useForm({
        initialValues: {
            email: '',
            name: '',
            password: '',
            repeatPassword: '',
            terms: true,
        },
        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
            repeatPassword: (val, values) => (val === values.password ? null : 'Passwords do not match'),
        },
    });

    return (
        <div className='flex justify-center items-center h-full'>
            <Paper p="lg" withBorder {...props} className=" max-w-xl w-full">
                <Text size="xl" align="center" fw={500} mb="lg">
                    Welcome to Course Compose
                </Text>

                <Divider labelPosition="center" my="lg" />

                <form onSubmit={form.onSubmit(() => { })}>
                    <Stack>
                        {type === 'register' && (
                            <TextInput
                                label="Name"
                                placeholder="Your name"
                                value={form.values.name}
                                onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
                                radius="md"
                                size="lg"
                            />
                        )}

                        <TextInput
                            required
                            label="Email"
                            placeholder="hello@mantine.dev"
                            value={form.values.email}
                            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                            error={form.errors.email && 'Invalid email'}
                            radius="lg"
                            size='lg'
                        />

                        <PasswordInput
                            required
                            label="Password"
                            placeholder="Your password"
                            value={form.values.password}
                            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                            error={form.errors.password && 'Password should include at least 6 characters'}
                            radius="lg"
                            size='lg'
                        />

                        {type === 'register' && (
                            <PasswordInput
                                required
                                label="Repeat Password"
                                placeholder="Repeat your password"
                                value={form.values.repeatPassword}
                                onChange={(event) => form.setFieldValue('repeatPassword', event.currentTarget.value)}
                                error={form.errors.repeatPassword}
                                radius="lg"
                                size='lg'
                            />
                        )}

                        {type === 'register' && (
                            <Checkbox
                                label="I accept terms and conditions"
                                checked={form.values.terms}
                                onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
                                size="md"
                            />
                        )}
                    </Stack>

                    <Group justify="space-between" mt="xl">
                        <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="md">
                            {type === 'register'
                                ? 'Already have an account? Login'
                                : "Don't have an account? Register"}
                        </Anchor>
                    </Group>
                </form>
            </Paper>
        </div>
    );
}
