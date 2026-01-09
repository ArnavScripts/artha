import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface MarketTicker {
    id: string;
    symbol: string;
    price: number;
    volume: number;
    timestamp: string;
}

export interface OrderBookItem {
    id: string;
    price: number;
    quantity: number;
    type: 'buy' | 'sell';
    total?: number; // Calculated on frontend usually
}

export interface TradeOrder {
    type: 'buy' | 'sell';
    price: number;
    quantity: number;
}

export const marketService = {
    // --- Ticker (Price Chart) ---

    async getTickerHistory() {
        const { data, error } = await supabase
            .from('market_ticker')
            .select('*')
            .order('timestamp', { ascending: true })
            .limit(100);

        if (error) throw error;
        return data as MarketTicker[];
    },

    subscribeToTicker(callback: (payload: MarketTicker) => void): RealtimeChannel {
        return supabase
            .channel('market_ticker_changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'market_ticker' },
                (payload) => {
                    callback(payload.new as MarketTicker);
                }
            )
            .subscribe();
    },

    // --- Order Book ---

    async getOrderBook() {
        const { data, error } = await supabase
            .from('order_book')
            .select('*')
            .eq('status', 'open')
            .order('price', { ascending: false });

        if (error) throw error;

        // Explicitly cast data to OrderBookItem[] to fix inference issues
        const rows = data as unknown as OrderBookItem[];

        const bids = rows.filter(d => d.type === 'buy');
        const asks = rows.filter(d => d.type === 'sell').sort((a, b) => a.price - b.price); // Lowest asks first

        return { bids, asks };
    },

    subscribeToOrderBook(callback: (payload: any) => void): RealtimeChannel {
        return supabase
            .channel('order_book_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'order_book' },
                (payload) => {
                    callback(payload);
                }
            )
            .subscribe();
    },

    // --- Trading ---

    async placeOrder(order: TradeOrder) {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('order_book')
            .insert({
                user_id: user.id,
                type: order.type,
                price: order.price,
                quantity: order.quantity,
                status: 'open'
            } as any) // Cast payload to any to bypass strict schema checks if types are missing
            .select()
            .single();

        if (error) throw error;
        return data; // Let inference handle the return or cast if needed
    }
};
