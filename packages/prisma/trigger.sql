-- These triggers are used to keep the auth.users and public."Profile" tables in sync.
-- To be executed manually in the SQL Editor on Supabase

-- Create or Replace Function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public."Profile" (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger: on_auth_user_created
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();

-- Create or Replace Function: handle_user_delete
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM auth.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Create Trigger: on_profile_user_deleted
CREATE OR REPLACE TRIGGER on_profile_user_deleted
AFTER DELETE ON public."Profile"
FOR EACH ROW
EXECUTE PROCEDURE public.handle_user_delete();
