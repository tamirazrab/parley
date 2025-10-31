import { PAGINATION } from "@parley/api/constants";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";


export const useAgentsFilters = () => {
  return useQueryStates({
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    page: parseAsInteger.withDefault(PAGINATION.DEFAULT.PAGE).withOptions({ clearOnDefault: true }),
  })
};
