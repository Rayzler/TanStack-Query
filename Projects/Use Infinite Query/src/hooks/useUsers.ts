import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUsers } from "../services/users";
import type { User } from "../types";

interface FetchResponse {
    users: User[];
    nextPage?: number;
}

function useUsers() {
    const queryClient = useQueryClient();
    const { isLoading, isError, data, refetch, fetchNextPage, hasNextPage } = useInfiniteQuery<FetchResponse>({
        queryKey: ["users"],
        queryFn: fetchUsers,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3
    });

    const removeUser = (email: string) => {
        queryClient.setQueryData(["users"], (oldData?: any) => {
            if (!oldData) return oldData;

            const newData = structuredClone(oldData);
            newData.pages = newData.pages.map((page: any) => {
                page.users = page.users.filter((user: User) => user.email !== email);
                return page;
            });
            return newData;
        });
    };

    return {
        isLoading,
        isError,
        users: data?.pages?.flatMap(page => page.users) ?? [],
        refetch,
        fetchNextPage,
        hasNextPage,
        removeUser
    };
}

export default useUsers;