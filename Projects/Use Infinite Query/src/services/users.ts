import { DATA_PER_PAGE, MAX_PAGES, SEED } from "../constants";

export async function fetchUsers({ pageParam = 1 }: { pageParam: unknown }) {
    const res = await fetch(`https://randomuser.me/api?results=${DATA_PER_PAGE}&seed=${SEED}&page=${pageParam}`)
        .then(res => {
            if (!res.ok) {
                throw new Error("Error fetching users");
            }
            return res.json();
        });

    return {
        users: res.results,
        nextPage: res.info.page >= MAX_PAGES ? undefined : res.info.page + 1
    };
}