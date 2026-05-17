import 'dotenv/config'
import cron from 'node-cron'
import { runHealthCheck } from './health-check'

const TIMEZONE = process.env.SCHEDULER_TZ ?? 'Asia/Jakarta'
const HEALTH_CRON = process.env.SCHEDULER_HEALTH_CRON ?? '0 */6 * * *'

type Task = { name: string; cron: string; run: () => Promise<unknown> }

const tasks: Task[] = [
  {
    name: 'health-check',
    cron: HEALTH_CRON,
    run: () => runHealthCheck(),
  },
]

for (const task of tasks) {
  if (!cron.validate(task.cron)) {
    console.error(`[scheduler] invalid cron "${task.cron}" for task "${task.name}" — aborting`)
    process.exit(1)
  }
  cron.schedule(
    task.cron,
    () => {
      task.run().catch((err) => {
        console.error(`[scheduler] task "${task.name}" threw:`, err)
      })
    },
    { timezone: TIMEZONE },
  )
}

console.log(`[scheduler] started (tz=${TIMEZONE})`)
for (const task of tasks) {
  console.log(`  ↳ ${task.name.padEnd(16)} ${task.cron}`)
}

void runHealthCheck()

process.stdin.resume()
const shutdown = (signal: string) => {
  console.log(`[scheduler] ${signal} received — shutting down`)
  process.exit(0)
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
