-- Migration: Add Admin Panel Models
-- Run this in Supabase SQL Editor

-- ========================================
-- 1. Extend users table
-- ========================================

-- Add player_id column for player account linking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS player_id UUID REFERENCES players(id) ON DELETE SET NULL;

-- Change default role from 'COACH' to 'FAN'
ALTER TABLE users
ALTER COLUMN role SET DEFAULT 'FAN';

-- Add index for player_id
CREATE INDEX IF NOT EXISTS idx_users_player_id ON users(player_id);

-- ========================================
-- 2. Extend players table
-- ========================================

-- Add Sanity profile linking
ALTER TABLE players
ADD COLUMN IF NOT EXISTS sanity_profile_id VARCHAR(255) UNIQUE;

-- Add player-editable fields
ALTER TABLE players
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS height_feet INTEGER,
ADD COLUMN IF NOT EXISTS height_inches INTEGER,
ADD COLUMN IF NOT EXISTS weight INTEGER,
ADD COLUMN IF NOT EXISTS jersey_number VARCHAR(10),
ADD COLUMN IF NOT EXISTS social_twitter VARCHAR(255),
ADD COLUMN IF NOT EXISTS social_instagram VARCHAR(255),
ADD COLUMN IF NOT EXISTS social_hudl VARCHAR(255);

-- Add index for sanity_profile_id
CREATE INDEX IF NOT EXISTS idx_players_sanity_profile_id ON players(sanity_profile_id);

-- ========================================
-- 3. Create player_claim_requests table
-- ========================================

CREATE TABLE IF NOT EXISTS player_claim_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL UNIQUE REFERENCES players(id) ON DELETE CASCADE,
    requested_email VARCHAR(255) NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    verification_info JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_player_claim_requests_status ON player_claim_requests(status);

-- ========================================
-- 4. Create college_offers table
-- ========================================

CREATE TABLE IF NOT EXISTS college_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    college_name VARCHAR(255) NOT NULL,
    college_division VARCHAR(50) NOT NULL,
    offer_type VARCHAR(50) NOT NULL,
    offer_date TIMESTAMP WITH TIME ZONE,
    sport VARCHAR(50) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_college_offers_player_id ON college_offers(player_id);
CREATE INDEX IF NOT EXISTS idx_college_offers_verified ON college_offers(verified);

-- ========================================
-- 5. Create rosters table
-- ========================================

CREATE TABLE IF NOT EXISTS rosters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    sport VARCHAR(50) NOT NULL,
    season VARCHAR(20) NOT NULL,
    jersey_number VARCHAR(10),
    position VARCHAR(50),
    grade VARCHAR(10),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    managed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(school_id, player_id, sport, season)
);

CREATE INDEX IF NOT EXISTS idx_rosters_school_sport_season ON rosters(school_id, sport, season);

-- ========================================
-- 6. Create admin_audit_logs table
-- ========================================

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    changes JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_user_id ON admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target ON admin_audit_logs(target_type, target_id);

-- ========================================
-- 7. Create updated_at trigger function (if not exists)
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. Add updated_at triggers to new tables
-- ========================================

DROP TRIGGER IF EXISTS update_player_claim_requests_updated_at ON player_claim_requests;
CREATE TRIGGER update_player_claim_requests_updated_at
    BEFORE UPDATE ON player_claim_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_college_offers_updated_at ON college_offers;
CREATE TRIGGER update_college_offers_updated_at
    BEFORE UPDATE ON college_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rosters_updated_at ON rosters;
CREATE TRIGGER update_rosters_updated_at
    BEFORE UPDATE ON rosters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Migration Complete
-- ========================================
-- Next step: Run `bunx prisma generate` to update Prisma client
