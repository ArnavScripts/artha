import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuditorDashboard() {
    const queryClient = useQueryClient();

    // 1. Fetch Pending Records
    const { data: records = [], isLoading } = useQuery({
        queryKey: ['auditorRecords'],
        queryFn: async () => {
            // Logic: Auditors can see ALL pending records.
            // RLS policy "Auditors view all emissions" handles the permission check.
            const { data, error } = await supabase
                .from('emissions_records')
                .select(`
          *,
          organization:organizations(name)
        `)
                .eq('status', 'pending') // Only show pending for verification queue
                .order('date', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    // 2. Verify/Reject Mutation
    const verifyMutation = useMutation({
        mutationFn: async ({ id, status, comment }: { id: string, status: 'verified' | 'rejected', comment?: string }) => {
            // Logic: RLS policy "Auditors verify emissions" allows updating status.
            // @ts-ignore - 'status' updatable via RLS, type definition pending
            const { data, error } = await supabase
                .from('emissions_records')
                .update({ status }) // In a perfect world, we'd add 'verified_by' and 'comment' too
                .eq('id', id)
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            toast.success(`Record ${variables.status === 'verified' ? 'Verified' : 'Rejected'}`, {
                description: "The organization has been notified via the system ledger."
            });
            queryClient.invalidateQueries({ queryKey: ['auditorRecords'] });
        },
        onError: (error) => {
            toast.error("Verification Failed", { description: error.message });
        }
    });

    const handleAction = (id: string, status: 'verified' | 'rejected') => {
        verifyMutation.mutate({ id, status });
    };

    return (
        <>
            <Helmet>
                <title>Auditor Portal - Bureau of Energy Efficiency</title>
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Auditor Verification Portal</h1>
                    <p className="text-muted-foreground mt-2">
                        Bureau of Energy Efficiency (BEE) - Compliance Verification System
                    </p>
                </div>

                <div className="grid gap-6">
                    <Card className="glass-panel border-white/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-500" />
                                Pending Verification Queue
                            </CardTitle>
                            <CardDescription>
                                Emissions reports submitted by Obligated Entities awaiting CCTS validation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : records.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">
                                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/20" />
                                    All caught up! No pending records found.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-white/5">
                                            <TableHead>Organization</TableHead>
                                            <TableHead>Source Information</TableHead>
                                            <TableHead>Reported Value</TableHead>
                                            <TableHead>Submission Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence>
                                            {records.map((record: any) => (
                                                <motion.tr
                                                    key={record.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="group hover:bg-white/5 transition-colors border-white/5"
                                                >
                                                    <TableCell className="font-medium text-white">
                                                        {record.organization?.name || 'Unknown Entity'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-foreground">{record.source}</span>
                                                            <Badge variant="outline" className="w-fit text-[10px] mt-1 text-muted-foreground border-white/10">
                                                                {record.type}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono text-lg font-bold">
                                                            {record.value.toLocaleString()}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground ml-1">{record.unit}</span>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {new Date(record.date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-red-500/20 hover:bg-red-500/10 hover:text-red-400 text-red-500"
                                                                onClick={() => handleAction(record.id, 'rejected')}
                                                                disabled={verifyMutation.isPending}
                                                            >
                                                                <XCircle className="w-4 h-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-500 hover:bg-green-400 text-black font-bold"
                                                                onClick={() => handleAction(record.id, 'verified')}
                                                                disabled={verifyMutation.isPending}
                                                            >
                                                                {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                                                                Verify
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
