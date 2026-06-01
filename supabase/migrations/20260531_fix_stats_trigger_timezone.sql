-- Phase 01: Fix timezone bug, silent update failure, and trailing empty rows
-- in fn_sync_clinic_daily_stats() trigger function.

CREATE OR REPLACE FUNCTION public.fn_sync_clinic_daily_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_date DATE;
    v_old_date DATE;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        v_date := (NEW.prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

        INSERT INTO public.clinic_daily_stats (clinic_id, date, visit_count, total_revenue)
        VALUES (NEW.clinic_id, v_date, 1, NEW.total_amount)
        ON CONFLICT (clinic_id, date) DO UPDATE
        SET visit_count = clinic_daily_stats.visit_count + 1,
            total_revenue = clinic_daily_stats.total_revenue + EXCLUDED.total_revenue;

        RETURN NEW;

    ELSIF (TG_OP = 'UPDATE') THEN
        v_old_date := (OLD.prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
        v_date := (NEW.prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

        IF (v_old_date <> v_date OR OLD.clinic_id <> NEW.clinic_id) THEN
            -- Decrement old date
            UPDATE public.clinic_daily_stats
            SET visit_count = visit_count - 1,
                total_revenue = total_revenue - OLD.total_amount
            WHERE clinic_id = OLD.clinic_id AND date = v_old_date;

            -- Cleanup old date if empty
            DELETE FROM public.clinic_daily_stats
            WHERE clinic_id = OLD.clinic_id AND date = v_old_date AND visit_count <= 0;

            -- Increment new date (UPSERT)
            INSERT INTO public.clinic_daily_stats (clinic_id, date, visit_count, total_revenue)
            VALUES (NEW.clinic_id, v_date, 1, NEW.total_amount)
            ON CONFLICT (clinic_id, date) DO UPDATE
            SET visit_count = clinic_daily_stats.visit_count + 1,
                total_revenue = clinic_daily_stats.total_revenue + EXCLUDED.total_revenue;
        ELSE
            -- Same day, same clinic: only adjust revenue (UPSERT for safety)
            INSERT INTO public.clinic_daily_stats (clinic_id, date, visit_count, total_revenue)
            VALUES (NEW.clinic_id, v_date, 0, NEW.total_amount - OLD.total_amount)
            ON CONFLICT (clinic_id, date) DO UPDATE
            SET total_revenue = clinic_daily_stats.total_revenue - OLD.total_amount + NEW.total_amount;
        END IF;

        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        v_date := (OLD.prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

        UPDATE public.clinic_daily_stats
        SET visit_count = visit_count - 1,
            total_revenue = total_revenue - OLD.total_amount
        WHERE clinic_id = OLD.clinic_id AND date = v_date;

        -- Cleanup: remove row if no visits left
        DELETE FROM public.clinic_daily_stats
        WHERE clinic_id = OLD.clinic_id AND date = v_date AND visit_count <= 0;

        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Re-attach trigger
DROP TRIGGER IF EXISTS trg_sync_clinic_daily_stats ON public.prescriptions_header;
CREATE TRIGGER trg_sync_clinic_daily_stats
AFTER INSERT OR UPDATE OR DELETE ON public.prescriptions_header
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_clinic_daily_stats();
