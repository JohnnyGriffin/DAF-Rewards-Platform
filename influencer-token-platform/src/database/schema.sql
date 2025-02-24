-- Users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'admin', 'creator', 'fan'
  kyc_verified BOOLEAN DEFAULT false,
  landing_page VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional Creators table for extended profile info
CREATE TABLE creators (
  creator_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id),
  display_name VARCHAR(100),
  bio TEXT,
  profile_image VARCHAR(255),
  social_media_handles JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tokens table
CREATE TABLE tokens (
  token_id SERIAL PRIMARY KEY,
  creator_id INT REFERENCES users(user_id),
  token_name VARCHAR(100) NOT NULL,
  token_symbol VARCHAR(20) NOT NULL,
  decimals INT DEFAULT 18,
  total_supply NUMERIC(30, 0) NOT NULL,
  revenue_share NUMERIC(5, 2) NOT NULL,
  token_price NUMERIC(30, 2) NOT NULL,
  platform_fee NUMERIC(5, 2),
  mintable BOOLEAN DEFAULT false,
  influencer_royalty NUMERIC(5, 2),
  upgradeable BOOLEAN DEFAULT false,
  emergency_pause BOOLEAN DEFAULT false,
  legal_disclaimer TEXT,
  terms_url VARCHAR(255),
  jurisdiction VARCHAR(100),
  contract_address VARCHAR(255),
  landing_page VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
  transaction_id SERIAL PRIMARY KEY,
  token_id INT REFERENCES tokens(token_id),
  user_id INT REFERENCES users(user_id),
  quantity NUMERIC(30, 2),
  price_at_purchase NUMERIC(30, 2),
  transaction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
  log_id SERIAL PRIMARY KEY,
  event_type VARCHAR(100),
  user_id INT,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);