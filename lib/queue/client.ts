import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export const processingQueue = new Queue('file-processing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

export function createWorker(processor: (job: any) => Promise<any>) {
  return new Worker('file-processing', processor, {
    connection,
    concurrency: 5,
  })
}

