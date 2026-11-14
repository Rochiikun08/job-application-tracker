-- Job Application Tracker: database schema
-- Development only: the next line wipes existing tables and data on every run.
-- Remove it once the app holds real data.
DROP TABLE IF EXISTS interviews, status_history, applications, users CASCADE;

-- ---------------------------------------------------------------
-- users
-- ---------------------------------------------------------------
CREATE TABLE users (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         TEXT        NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- applications
-- ---------------------------------------------------------------
CREATE TABLE applications (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       BIGINT      NOT NULL
                  REFERENCES users (id) ON DELETE CASCADE,
    company       TEXT        NOT NULL,
    role          TEXT        NOT NULL,
    job_url       TEXT,
    location      TEXT,
    source        TEXT,
    status        TEXT        NOT NULL DEFAULT 'wishlist',
    date_applied  DATE,
    follow_up_on  DATE,
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_applications_status CHECK (status IN (
        'wishlist', 'applied', 'online_assessment',
        'interview', 'offer', 'rejected', 'withdrawn'
    )),
    CONSTRAINT uq_applications_user_company_role
        UNIQUE (user_id, company, role)
);

-- ---------------------------------------------------------------
-- status_history
-- ---------------------------------------------------------------
CREATE TABLE status_history (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id BIGINT      NOT NULL
                   REFERENCES applications (id) ON DELETE CASCADE,
    from_status    TEXT,
    to_status      TEXT        NOT NULL,
    changed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    note           TEXT,

    CONSTRAINT chk_status_history_from CHECK (from_status IS NULL OR from_status IN (
        'wishlist', 'applied', 'online_assessment',
        'interview', 'offer', 'rejected', 'withdrawn'
    )),
    CONSTRAINT chk_status_history_to CHECK (to_status IN (
        'wishlist', 'applied', 'online_assessment',
        'interview', 'offer', 'rejected', 'withdrawn'
    ))
);

-- ---------------------------------------------------------------
-- interviews
-- ---------------------------------------------------------------
CREATE TABLE interviews (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id   BIGINT      NOT NULL
                     REFERENCES applications (id) ON DELETE CASCADE,
    kind             TEXT        NOT NULL,
    scheduled_at     TIMESTAMPTZ NOT NULL,
    location_or_link TEXT,
    outcome          TEXT        DEFAULT 'pending',
    notes            TEXT,

    CONSTRAINT chk_interviews_kind CHECK (kind IN (
        'phone_screen', 'technical', 'behavioural', 'final', 'assessment'
    )),
    CONSTRAINT chk_interviews_outcome CHECK (outcome IN (
        'pending', 'passed', 'failed'
    ))
);

-- ---------------------------------------------------------------
-- indexes
-- (primary keys and the UNIQUE constraints are indexed automatically)
-- ---------------------------------------------------------------
CREATE INDEX idx_applications_user_status
    ON applications (user_id, status);

CREATE INDEX idx_applications_user_date_applied
    ON applications (user_id, date_applied);

CREATE INDEX idx_status_history_application_id
    ON status_history (application_id);

CREATE INDEX idx_interviews_application_id
    ON interviews (application_id);

-- ---------------------------------------------------------------
-- keep applications.updated_at current on every UPDATE
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();