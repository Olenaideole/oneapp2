-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255),
  amount_paid DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  product VARCHAR(100) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session ON purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);

-- Add purchased column to quiz_responses table
ALTER TABLE quiz_responses 
ADD COLUMN IF NOT EXISTS purchased BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255);

-- Create index for purchased status
CREATE INDEX IF NOT EXISTS idx_quiz_responses_purchased ON quiz_responses(purchased);
