import { relations } from 'drizzle-orm'
import { accounts, sessions } from './auth'
import { announcements } from './announcements'
import { dutyAssignments } from './duties'
import { cashAccounts } from './cashAccounts'
import { categories } from './categories'
import { eventAgendaItems, eventSpeakers, events } from './events'
import { mosqueProfile } from './mosqueProfile'
import { registrants } from './registrants'
import { transactionCategories } from './transactionCategories'
import { transactions } from './transactions'
import { users } from './users'

// Relations power `db.query.<table>.findMany({ with: { ... } })`.
// When a table references another table more than once (e.g. transactions →
// cash_accounts as source AND destination) every side needs a `relationName`.

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  registrations: many(registrants, { relationName: 'registrant_user' }),
  checkIns: many(registrants, { relationName: 'registrant_checker' }),
  transactionsCreated: many(transactions, { relationName: 'transaction_creator' }),
  transactionsUpdated: many(transactions, { relationName: 'transaction_updater' }),
  announcementsCreated: many(announcements, { relationName: 'announcement_creator' }),
  announcementsUpdated: many(announcements, { relationName: 'announcement_updater' }),
  dutiesCreated: many(dutyAssignments, { relationName: 'duty_creator' }),
  dutiesUpdated: many(dutyAssignments, { relationName: 'duty_updater' }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const mosqueProfileRelations = relations(mosqueProfile, ({ one }) => ({
  updater: one(users, { fields: [mosqueProfile.updatedBy], references: [users.id] }),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  events: many(events),
}))

export const eventsRelations = relations(events, ({ one, many }) => ({
  category: one(categories, { fields: [events.categoryId], references: [categories.id] }),
  speakers: many(eventSpeakers),
  agenda: many(eventAgendaItems),
  registrants: many(registrants),
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
    relationName: 'event_creator',
  }),
  updater: one(users, {
    fields: [events.updatedBy],
    references: [users.id],
    relationName: 'event_updater',
  }),
}))

export const eventSpeakersRelations = relations(eventSpeakers, ({ one }) => ({
  event: one(events, { fields: [eventSpeakers.eventId], references: [events.id] }),
}))

export const eventAgendaItemsRelations = relations(eventAgendaItems, ({ one }) => ({
  event: one(events, { fields: [eventAgendaItems.eventId], references: [events.id] }),
}))

export const registrantsRelations = relations(registrants, ({ one }) => ({
  event: one(events, { fields: [registrants.eventId], references: [events.id] }),
  user: one(users, {
    fields: [registrants.userId],
    references: [users.id],
    relationName: 'registrant_user',
  }),
  checkedInByUser: one(users, {
    fields: [registrants.checkedInBy],
    references: [users.id],
    relationName: 'registrant_checker',
  }),
}))

export const cashAccountsRelations = relations(cashAccounts, ({ many }) => ({
  outgoing: many(transactions, { relationName: 'transaction_account' }),
  incoming: many(transactions, { relationName: 'transaction_destination' }),
}))

export const transactionCategoriesRelations = relations(
  transactionCategories,
  ({ one, many }) => ({
    parent: one(transactionCategories, {
      fields: [transactionCategories.parentId],
      references: [transactionCategories.id],
      relationName: 'category_parent',
    }),
    children: many(transactionCategories, { relationName: 'category_parent' }),
    transactions: many(transactions),
  }),
)

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(cashAccounts, {
    fields: [transactions.accountId],
    references: [cashAccounts.id],
    relationName: 'transaction_account',
  }),
  destinationAccount: one(cashAccounts, {
    fields: [transactions.destinationAccountId],
    references: [cashAccounts.id],
    relationName: 'transaction_destination',
  }),
  category: one(transactionCategories, {
    fields: [transactions.categoryId],
    references: [transactionCategories.id],
  }),
  creator: one(users, {
    fields: [transactions.createdBy],
    references: [users.id],
    relationName: 'transaction_creator',
  }),
  updater: one(users, {
    fields: [transactions.updatedBy],
    references: [users.id],
    relationName: 'transaction_updater',
  }),
}))

export const announcementsRelations = relations(announcements, ({ one }) => ({
  creator: one(users, { fields: [announcements.createdBy], references: [users.id], relationName: 'announcement_creator' }),
  updater: one(users, { fields: [announcements.updatedBy], references: [users.id], relationName: 'announcement_updater' }),
}))

export const dutyAssignmentsRelations = relations(dutyAssignments, ({ one }) => ({
  creator: one(users, { fields: [dutyAssignments.createdBy], references: [users.id], relationName: 'duty_creator' }),
  updater: one(users, { fields: [dutyAssignments.updatedBy], references: [users.id], relationName: 'duty_updater' }),
}))
