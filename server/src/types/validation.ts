/** Represents a constructor for a class */
type ClassType<T extends object> = { new (...args: any[]): T };

export type { ClassType };
