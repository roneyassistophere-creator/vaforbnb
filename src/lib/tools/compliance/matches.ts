import type { Condition, Facts } from "./types";

/**
 * Does a stored condition match the host's facts?
 *  {}                                   always true
 *  { all: [...] } / { any: [...] }      can nest
 *  { field, eq } / { field, in: [...] } compare a fact
 *  { field, includes }                  array fact contains the value
 */
export function matches(condition: Condition, facts: Facts): boolean {
  if ("all" in condition && Array.isArray(condition.all)) return condition.all.every((c) => matches(c, facts));
  if ("any" in condition && Array.isArray(condition.any)) return condition.any.some((c) => matches(c, facts));
  if (!("field" in condition)) return Object.keys(condition).length === 0;

  const value = facts[condition.field];
  if ("eq" in condition) return value === condition.eq;
  if ("in" in condition && Array.isArray(condition.in)) return condition.in.includes(value as string | boolean);
  if ("includes" in condition) return Array.isArray(value) && (value as string[]).includes(condition.includes as string);
  return false;
}
