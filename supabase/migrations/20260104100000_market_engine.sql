-- Market Engine Schema for CCTS Trading
-- Supports Real-time simulated exchange

DROP TABLE IF EXISTS public.trade_history CASCADE;
DROP TABLE IF EXISTS public.order_book CASCADE;
DROP TABLE IF EXISTS public.market_ticker CASCADE;

-- 1. Market Ticker (Time-series for price chart)
CREATE TABLE IF NOT EXISTS public.market_ticker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL DEFAULT 'CCTS',
    price NUMERIC NOT NULL,
    volume NUMERIC NOT NULL DEFAULT 0,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Order Book (Active Bids and Asks)
CREATE TABLE IF NOT EXISTS public.order_book (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
    price NUMERIC NOT NULL,
    quantity NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trade History (Executed Trades)
CREATE TABLE IF NOT EXISTS public.trade_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES auth.users(id) NOT NULL,
    seller_id UUID REFERENCES auth.users(id) NOT NULL,
    price NUMERIC NOT NULL,
    quantity NUMERIC NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    transaction_hash TEXT -- Simulation of blockchain hash
);

-- RLS Policies

-- Market Ticker: Readable by everyone, writable only by service role (admin/bot)
ALTER TABLE public.market_ticker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON public.market_ticker FOR SELECT
TO authenticated
USING (true);

-- Order Book: Users can read all open orders (transparency), but only manage their own
ALTER TABLE public.order_book ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all open orders"
ON public.order_book FOR SELECT
TO authenticated
USING (status = 'open');

CREATE POLICY "Users can insert their own orders"
ON public.order_book FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
ON public.order_book FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Enable Realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_ticker;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_book;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_history;

-- Seeds for Initial Market State
INSERT INTO public.market_ticker (price, volume, timestamp) VALUES 
(575, 12400, NOW() - INTERVAL '6 hours'),
(578, 15600, NOW() - INTERVAL '5 hours'),
(590, 23400, NOW() - INTERVAL '2 hours'),
(598, 31200, NOW() - INTERVAL '1 hour'),
(594, 5000, NOW());

