import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { FeeInfo } from '@/types';

export function useFees() {
  // Fetch fee information
  const { data: feeInfo, isLoading: isLoadingFeeInfo } = useQuery<FeeInfo>({
    queryKey: ['fee-info'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.FEE_INFO);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    feeInfo,
    isLoadingFeeInfo,
  };
}