-- Phase 01: Database Rollup & Triggers
-- Created At: 2026-05-11

-- 1. [ ] Tạo Migration: Tạo bảng clinic_daily_stats
CREATE TABLE IF NOT EXISTS public.clinic_daily_stats (
    clinic_id BIGINT REFERENCES public.clinics(id) ON DELETE CASCADE,
    date DATE,
    visit_count INTEGER DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    PRIMARY KEY (clinic_id, date)
);

-- 2. [ ] Setup Security:
ALTER TABLE public.clinic_daily_stats ENABLE ROW LEVEL SECURITY;

-- Thêm policy SELECT/ALL cho authenticated users với clinic_id = get_my_clinic_id()
DROP POLICY IF EXISTS "Users can view their own clinic's stats" ON public.clinic_daily_stats;
CREATE POLICY "Users can view their own clinic's stats"
    ON public.clinic_daily_stats
    FOR SELECT
    TO authenticated
    USING (clinic_id = get_my_clinic_id());

DROP POLICY IF EXISTS "Users can manage their own clinic's stats" ON public.clinic_daily_stats;
CREATE POLICY "Users can manage their own clinic's stats"
    ON public.clinic_daily_stats
    FOR ALL
    TO authenticated
    USING (clinic_id = get_my_clinic_id())
    WITH CHECK (clinic_id = get_my_clinic_id());

-- 3. [ ] Viết Function Trình kích hoạt (Trigger Function):
-- Tạo fn_sync_clinic_daily_stats() để tự động tăng/giảm visit_count và total_revenue khi bảng prescriptions_header thay đổi.
CREATE OR REPLACE FUNCTION public.fn_sync_clinic_daily_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_date DATE;
    v_clinic_id BIGINT;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        v_date := NEW.prescription_date::DATE;
        v_clinic_id := NEW.clinic_id;
        
        INSERT INTO public.clinic_daily_stats (clinic_id, date, visit_count, total_revenue)
        VALUES (v_clinic_id, v_date, 1, NEW.total_amount)
        ON CONFLICT (clinic_id, date) DO UPDATE
        SET visit_count = clinic_daily_stats.visit_count + 1,
            total_revenue = clinic_daily_stats.total_revenue + EXCLUDED.total_revenue;
            
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Nếu thay đổi ngày hoặc clinic_id (hiếm khi xảy ra)
        IF (OLD.prescription_date::DATE <> NEW.prescription_date::DATE OR OLD.clinic_id <> NEW.clinic_id) THEN
            -- Giảm số liệu cũ
            UPDATE public.clinic_daily_stats
            SET visit_count = visit_count - 1,
                total_revenue = total_revenue - OLD.total_amount
            WHERE clinic_id = OLD.clinic_id AND date = OLD.prescription_date::DATE;
            
            -- Tăng số liệu mới
            INSERT INTO public.clinic_daily_stats (clinic_id, date, visit_count, total_revenue)
            VALUES (NEW.clinic_id, NEW.prescription_date::DATE, 1, NEW.total_amount)
            ON CONFLICT (clinic_id, date) DO UPDATE
            SET visit_count = clinic_daily_stats.visit_count + 1,
                total_revenue = clinic_daily_stats.total_revenue + EXCLUDED.total_revenue;
        ELSE
            -- Chỉ cập nhật doanh thu nếu cùng ngày và cùng clinic
            UPDATE public.clinic_daily_stats
            SET total_revenue = total_revenue - OLD.total_amount + NEW.total_amount
            WHERE clinic_id = NEW.clinic_id AND date = NEW.prescription_date::DATE;
        END IF;
        
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.clinic_daily_stats
        SET visit_count = visit_count - 1,
            total_revenue = total_revenue - OLD.total_amount
        WHERE clinic_id = OLD.clinic_id AND date = OLD.prescription_date::DATE;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. [ ] Tạo Trigger:
-- Gắn vào prescriptions_header cho các sự kiện AFTER INSERT, UPDATE, DELETE.
DROP TRIGGER IF EXISTS trg_sync_clinic_daily_stats ON public.prescriptions_header;
CREATE TRIGGER trg_sync_clinic_daily_stats
AFTER INSERT OR UPDATE OR DELETE ON public.prescriptions_header
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_clinic_daily_stats();

-- Dọn dẹp trigger cũ (nếu có) để tránh xung đột
DROP TRIGGER IF EXISTS trg_update_daily_stats_header_del ON public.prescriptions_header;
DROP TRIGGER IF EXISTS trg_update_daily_stats_header_ins_upd ON public.prescriptions_header;

-- 5. [ ] Backfill Data:
-- Chạy một script SQL một lần để tổng hợp dữ liệu cũ từ prescriptions_header vào bảng rollup.
TRUNCATE public.clinic_daily_stats; -- Đảm bảo sạch sẽ trước khi backfill

INSERT INTO public.clinic_daily_stats (clinic_id, date, visit_count, total_revenue)
SELECT 
    clinic_id, 
    prescription_date::DATE, 
    COUNT(*), 
    COALESCE(SUM(total_amount), 0)
FROM public.prescriptions_header
GROUP BY clinic_id, prescription_date::DATE
ON CONFLICT (clinic_id, date) DO UPDATE
SET visit_count = EXCLUDED.visit_count,
    total_revenue = EXCLUDED.total_revenue;
