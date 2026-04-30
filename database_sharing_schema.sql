-- Diary Sharing System Database Schema
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Create shares table
CREATE TABLE IF NOT EXISTS public.shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_email TEXT,
    shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    share_type TEXT NOT NULL CHECK (share_type IN ('all', 'category', 'item')),
    category_name TEXT,
    item_id UUID REFERENCES public.item(id) ON DELETE CASCADE,
    permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')) DEFAULT 'view',
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    message TEXT,
    CONSTRAINT share_target_check CHECK (
        (shared_with_email IS NOT NULL AND shared_with_user_id IS NULL) OR
        (shared_with_email IS NULL AND shared_with_user_id IS NOT NULL)
    )
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shares_owner ON public.shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_shares_shared_with_user ON public.shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_shares_shared_with_email ON public.shares(shared_with_email);
CREATE INDEX IF NOT EXISTS idx_shares_status ON public.shares(status);

-- 3. Enable Row Level Security
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if any
DROP POLICY IF EXISTS "Users can view shares they own" ON public.shares;
DROP POLICY IF EXISTS "Users can view shares shared with them" ON public.shares;
DROP POLICY IF EXISTS "Users can insert their own shares" ON public.shares;
DROP POLICY IF EXISTS "Users can update their own shares" ON public.shares;
DROP POLICY IF EXISTS "Users can delete their own shares" ON public.shares;
DROP POLICY IF EXISTS "Shared users can update share status" ON public.shares;

-- 5. Create RLS Policies
-- Allow users to view shares they created
CREATE POLICY "Users can view shares they own"
ON public.shares FOR SELECT
USING (auth.uid() = owner_id);

-- Allow users to view shares shared with them (by user_id or email)
CREATE POLICY "Users can view shares shared with them"
ON public.shares FOR SELECT
USING (
    auth.uid() = shared_with_user_id OR
    auth.email() = shared_with_email
);

-- Allow users to create shares
CREATE POLICY "Users can insert their own shares"
ON public.shares FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Allow users to update their own shares
CREATE POLICY "Users can update their own shares"
ON public.shares FOR UPDATE
USING (auth.uid() = owner_id);

-- Allow users to delete their own shares
CREATE POLICY "Users can delete their own shares"
ON public.shares FOR DELETE
USING (auth.uid() = owner_id);

-- Allow shared users to update share status (accept/decline)
CREATE POLICY "Shared users can update share status"
ON public.shares FOR UPDATE
USING (
    auth.uid() = shared_with_user_id OR
    auth.email() = shared_with_email
)
WITH CHECK (
    auth.uid() = shared_with_user_id OR
    auth.email() = shared_with_email
);

-- 6. Create function to check if user can access shared content
CREATE OR REPLACE FUNCTION public.can_access_shared_content(
    content_owner_id UUID,
    content_type TEXT, -- 'category' or 'item'
    content_category_name TEXT DEFAULT NULL,
    content_item_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Owner can always access
    IF auth.uid() = content_owner_id THEN
        RETURN TRUE;
    END IF;

    -- Check if there's an accepted share
    RETURN EXISTS (
        SELECT 1 FROM public.shares
        WHERE owner_id = content_owner_id
        AND status = 'accepted'
        AND (
            shared_with_user_id = auth.uid() OR
            shared_with_email = auth.email()
        )
        AND (
            -- Share all diary
            share_type = 'all'
            OR
            -- Share specific category
            (share_type = 'category' AND category_name = content_category_name)
            OR
            -- Share specific item
            (share_type = 'item' AND item_id = content_item_id)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shares TO authenticated;
GRANT USAGE ON SEQUENCE public.shares_id_seq TO authenticated;

-- 8. Create notification table for share invitations (optional)
CREATE TABLE IF NOT EXISTS public.share_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    share_id UUID REFERENCES public.shares(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_share_notifications_user ON public.share_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_share_notifications_read ON public.share_notifications(is_read);

ALTER TABLE public.share_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.share_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.share_notifications FOR INSERT
WITH CHECK (true);

GRANT SELECT ON public.share_notifications TO authenticated;
GRANT INSERT ON public.share_notifications TO authenticated;

-- Done! Your sharing system is now set up.
