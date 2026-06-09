/**
 * State shape for the Refill server action, kept in a plain module so it can be
 * shared by both the action and the client form. (A "use server" file may only
 * export async functions, so the type/initial value can't live alongside it.)
 */
export interface RefillActionState {
  status: "idle" | "success";
  message: string;
  /** Bumped on each completion so the UI reacts even to identical resubmits. */
  key: number;
}

export const initialRefillState: RefillActionState = {
  status: "idle",
  message: "",
  key: 0,
};
