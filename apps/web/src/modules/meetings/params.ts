import { createLoader, parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";

import { MeetingStatus } from "./types";
import { PAGINATION } from "@/lib/constants";

export const filtersSearchParams = {
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  page: parseAsInteger.withDefault(PAGINATION.DEFAULT.PAGE).withOptions({ clearOnDefault: true }),
  status: parseAsStringEnum(Object.values(MeetingStatus)),
  agentId: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

export const loadSearchParams = createLoader(filtersSearchParams);
