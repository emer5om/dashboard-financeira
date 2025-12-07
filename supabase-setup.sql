-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ads', 'expense', 'revenue')),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  category TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Enable Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Enable all access for transactions" ON transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert sample data (optional)
INSERT INTO transactions (date, type, amount, category, note) VALUES
  ('2025-12-07', 'revenue', 5000, 'Vendas Online', 'Vendas do dia'),
  ('2025-12-07', 'ads', 800, 'Google Ads', 'Campanha de conversão'),
  ('2025-12-07', 'expense', 200, 'Ferramentas', 'Assinatura SaaS'),
  ('2025-12-06', 'revenue', 4200, 'Vendas Online', 'Vendas do dia anterior'),
  ('2025-12-06', 'ads', 650, 'Facebook Ads', 'Campanha de engajamento'),
  ('2025-12-06', 'expense', 150, 'Hospedagem', 'Servidor')
ON CONFLICT (id) DO NOTHING;
