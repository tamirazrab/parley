import { MEETING_STATUS } from '@/lib/constants';
import { PAGINATION } from "@parley/api/constants";
import { parseAsInteger, parseAsString, useQueryStates, parseAsStringEnum } from "nuqs";

export const useMeetingsFilters = () => {
  return useQueryStates({
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    page: parseAsInteger.withDefault(PAGINATION.DEFAULT.PAGE).withOptions({ clearOnDefault: true }),
    status: parseAsStringEnum(Object.values(MEETING_STATUS)),
    agentId: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  });
};