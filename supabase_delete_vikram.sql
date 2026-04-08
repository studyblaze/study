-- DELETE VIKRAM SINGH DUMMY DATA WITH CASCADED DELETIONS
DO $$ 
DECLARE 
    vikram_id UUID;
    v_tutor_id INT;
BEGIN
    -- 1. Identify IDs
    SELECT id INTO vikram_id FROM public.profiles WHERE full_name ILIKE '%Vikram Singh%' LIMIT 1;
    -- Note: tutors table doesn't have 'name' column, it's linked via profile_id
    SELECT id INTO v_tutor_id FROM public.tutors WHERE profile_id = vikram_id LIMIT 1;
    
    IF vikram_id IS NOT NULL THEN
        -- 2. Delete references to tutor_id (with existence checks)
        IF v_tutor_id IS NOT NULL THEN
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'favorite_tutors') THEN
                DELETE FROM public.favorite_tutors WHERE tutor_id = v_tutor_id;
            END IF;
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reviews') THEN
                DELETE FROM public.reviews WHERE tutor_id = v_tutor_id;
            END IF;
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'recordings') THEN
                DELETE FROM public.recordings WHERE tutor_id = v_tutor_id;
            END IF;
            
            -- Session-based bookings cleanup
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sessions') THEN
                IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
                    DELETE FROM public.bookings WHERE session_id IN (SELECT id FROM public.sessions WHERE tutor_id = v_tutor_id);
                END IF;
                DELETE FROM public.sessions WHERE tutor_id = v_tutor_id;
            END IF;
            
            DELETE FROM public.tutors WHERE id = v_tutor_id;
        END IF;

        -- 3. Delete references to profile_id (sender/receiver/etc)
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
            DELETE FROM public.messages WHERE sender_id = vikram_id OR receiver_id = vikram_id;
        END IF;
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'support_messages') THEN
            DELETE FROM public.support_messages WHERE user_id = vikram_id;
        END IF;
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
            DELETE FROM public.bookings WHERE student_id = vikram_id;
        END IF;
        
        -- 4. Final Deletions
        DELETE FROM public.profiles WHERE id = vikram_id;
    END IF;
END $$;
