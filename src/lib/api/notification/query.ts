import { useInfiniteQuery } from "@tanstack/react-query";
import { getNotifications } from "./notification";

export function useNotificationsQuery() {
   return useInfiniteQuery({
      queryKey: ["notifications"],
      queryFn: ({ pageParam }) => getNotifications({ cursor: pageParam }),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
   });
}
