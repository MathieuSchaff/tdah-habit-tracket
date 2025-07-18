import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums pour type safety
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const statusEnum = pgEnum("status", [
  "completed",
  "partial",
  "skipped",
  "missed",
]);
export const categoryEnum = pgEnum("category", [
  "mental_health",
  "physical_health",
  "productivity",
  "social",
  "creativity",
]);

// Table users (étend auth.users de Supabase)
export const users = pgTable("users", {
  id: text("id").primaryKey(), // UUID from Supabase auth
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profil TDAH spécifique
export const tdahProfiles = pgTable("tdah_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  severity: text("severity"), // 'mild', 'moderate', 'severe'
  medication: boolean("medication").default(false),
  triggers: text("triggers"), // JSON string of trigger words/situations
  preferences: text("preferences"), // JSON string of UI preferences
  gamificationLevel: integer("gamification_level").default(3), // 1-5 scale
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Table habitudes
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: categoryEnum("category").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),

  // Flexibilité TDAH
  minDuration: integer("min_duration").default(5), // minutes minimum
  targetDuration: integer("target_duration").default(30), // minutes idéal

  // Fréquence flexible au lieu de "daily"
  frequencyType: text("frequency_type").default("weekly"), // 'daily', 'weekly'
  frequencyTarget: integer("frequency_target").default(3), // 3 fois par semaine par exemple

  // Contexte et triggers
  timeOfDay: text("time_of_day"), // 'morning', 'afternoon', 'evening', 'flexible'
  linkedHabitId: integer("linked_habit_id"), // Pour habit stacking

  // Métadonnées
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Check-ins quotidiens
export const dailyChecks = pgTable("daily_checks", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id")
    .references(() => habits.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  date: timestamp("date").notNull(), // Date du check-in
  status: statusEnum("status").notNull(),

  // Données contextuelles TDAH
  actualDuration: integer("actual_duration"), // Minutes réellement passées
  energyLevel: integer("energy_level"), // 1-5 scale
  focusLevel: integer("focus_level"), // 1-5 scale
  mood: integer("mood"), // 1-5 scale

  // Notes et contexte
  notes: text("notes"),
  triggers: text("triggers"), // Ce qui a aidé/nui ce jour

  createdAt: timestamp("created_at").defaultNow(),
});

// Système de points et gamification
export const userPoints = pgTable("user_points", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  totalPoints: integer("total_points").default(0),
  level: integer("level").default(1),
  weeklyPoints: integer("weekly_points").default(0),
  monthlyPoints: integer("monthly_points").default(0),

  // Streaks flexibles TDAH
  longestStreak: integer("longest_streak").default(0),
  currentStreakDays: integer("current_streak_days").default(0),

  updatedAt: timestamp("updated_at").defaultNow(),
});

// Badges et achievements
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  badgeType: text("badge_type").notNull(), // 'first_week', 'comeback_kid', 'micro_master', etc.
  habitId: integer("habit_id").references(() => habits.id), // Badge lié à une habitude spécifique
  metadata: text("metadata"), // JSON pour données supplémentaires
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Types d'inférence pour TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type TdahProfile = typeof tdahProfiles.$inferSelect;
export type NewTdahProfile = typeof tdahProfiles.$inferInsert;

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;

export type DailyCheck = typeof dailyChecks.$inferSelect;
export type NewDailyCheck = typeof dailyChecks.$inferInsert;

export type UserPoints = typeof userPoints.$inferSelect;
export type NewUserPoints = typeof userPoints.$inferInsert;

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
