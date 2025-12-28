import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService, Profile, Organization } from '@/services/profile.service';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function useProfile() {
    const queryClient = useQueryClient();

    const userQuery = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        },
    });

    const isDemoUser = userQuery.data?.email === 'demo@artha.com';

    const profileQuery = useQuery({
        queryKey: ['profile'],
        queryFn: profileService.getProfile,
        enabled: !isDemoUser,
    });

    const organizationQuery = useQuery({
        queryKey: ['organization', profileQuery.data?.organization_id],
        queryFn: () => {
            const orgId = profileQuery.data?.organization_id;
            if (!orgId) throw new Error('No organization ID');
            return profileService.getOrganization(orgId);
        },
        enabled: !!profileQuery.data?.organization_id && !isDemoUser,
    });

    const updateProfileMutation = useMutation({
        mutationFn: profileService.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            toast.success('Profile updated successfully');
        },
        onError: (error) => {
            toast.error(`Failed to update profile: ${error.message}`);
        },
    });

    const demoOrganization: Organization = {
        id: 'demo-org-id',
        name: 'Artha Demo Corp',
        industry: 'Manufacturing & Heavy Industry',
        tier: 'enterprise',
        credits_purchased: 150000,
        created_at: new Date().toISOString(),
    };

    return {
        user: userQuery.data,
        profile: isDemoUser ? {
            id: userQuery.data?.id || 'demo-user-id',
            email: 'demo@artha.com',
            full_name: 'Demo Administrator',
            organization_id: 'demo-org-id',
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        } as Profile : (profileQuery.data || null),
        organization: isDemoUser ? demoOrganization : (organizationQuery.data || null),
        isLoading: (!isDemoUser && (profileQuery.isLoading || organizationQuery.isLoading)) || userQuery.isLoading,
        updateProfile: updateProfileMutation.mutate,
        isUpdating: updateProfileMutation.isPending,
    };
}
