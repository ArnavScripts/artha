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
    });

    const organizationQuery = useQuery({
        queryKey: ['organization', profileQuery.data?.organization_id],
        queryFn: () => {
            const orgId = profileQuery.data?.organization_id;
            if (!orgId) throw new Error('No organization ID');
            return profileService.getOrganization(orgId);
        },
        enabled: !!profileQuery.data?.organization_id,
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

    return {
        user: userQuery.data,
        profile: profileQuery.data || null,
        organization: organizationQuery.data || null,
        isLoading: profileQuery.isLoading || organizationQuery.isLoading || userQuery.isLoading,
        updateProfile: updateProfileMutation.mutate,
        isUpdating: updateProfileMutation.isPending,
    };
}
