package com.kylix

import org.quartz.*
import org.quartz.impl.StdSchedulerFactory
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import kotlin.system.exitProcess

data class RestartStatus(
    val status: String,
    val startTime: String,
    val uptime: String,
    val lastRestartScheduled: String? = null,
    val nextRestart: String? = null,
    val restartCount: Int = 0
)

object AppManager {
    private val startTime = LocalDateTime.now()
    private var lastRestartScheduled: LocalDateTime? = null
    private var restartCount = 0

    fun getStatus(): RestartStatus {
        val now = LocalDateTime.now()
        val uptime = java.time.Duration.between(startTime, now)
        val uptimeString = "${uptime.toHours()}h ${uptime.toMinutes() % 60}m ${uptime.seconds % 60}s"

        val scheduler = CronManager.getScheduler()
        val nextFireTime = scheduler?.getTrigger(TriggerKey.triggerKey("restartTrigger", "restartGroup"))?.nextFireTime

        return RestartStatus(
            status = "running",
            startTime = startTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
            uptime = uptimeString,
            lastRestartScheduled = lastRestartScheduled?.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
            nextRestart = nextFireTime?.toString(),
            restartCount = restartCount
        )
    }

    fun scheduleRestart() {
        lastRestartScheduled = LocalDateTime.now()
        restartCount++
        println("Restart scheduled at: $lastRestartScheduled (Restart #$restartCount)")
    }
}

class RestartJob : Job {
    override fun execute(context: JobExecutionContext?) {
        println("=== SCHEDULED RESTART INITIATED ===")
        println("Time: ${LocalDateTime.now()}")
        println("Reason: Scheduled maintenance restart")

        AppManager.scheduleRestart()

        // Perform any cleanup before restart
        performPreRestartCleanup()

        // Give some time for cleanup and logging
        Thread.sleep(2000)

        println("Initiating application restart...")

        // Exit the application - Railway will automatically restart it
        exitProcess(0)
    }

    private fun performPreRestartCleanup() {
        println("Performing pre-restart cleanup...")

        // Add your cleanup logic here:
        // - Close database connections
        // - Flush logs
        // - Save state
        // - Clear caches
        // - Send notifications

        try {
            // Example cleanup tasks
            println("- Flushing application logs")
            System.out.flush()
            System.err.flush()

            println("- Clearing memory caches")
            System.gc()

            println("- Cleanup completed successfully")

        } catch (e: Exception) {
            println("Warning: Cleanup error: ${e.message}")
        }
    }
}

object CronManager {
    private var scheduler: Scheduler? = null

    fun start() {
        try {
            scheduler = StdSchedulerFactory.getDefaultScheduler()

            // Define the restart job
            val restartJob = JobBuilder.newJob(RestartJob::class.java)
                .withIdentity("restartJob", "restartGroup")
                .build()

            // Define the restart trigger
            // IMPORTANT: Choose your restart schedule carefully!
            val restartTrigger = TriggerBuilder.newTrigger()
                .withIdentity("restartTrigger", "restartGroup")
                .startNow()
                .withSchedule(
                    CronScheduleBuilder.cronSchedule("0 */5 * * * ?")
                )
                .build()

            // Schedule the restart job
            scheduler?.scheduleJob(restartJob, restartTrigger)
            scheduler?.start()

            val nextRestart = restartTrigger.nextFireTime
            println("=== RESTART SCHEDULER STARTED ===")
            println("Next scheduled restart: $nextRestart")
            println("Schedule: Every 6 hours")

        } catch (e: Exception) {
            println("Error starting restart scheduler: ${e.message}")
            e.printStackTrace()
        }
    }

    fun stop() {
        try {
            scheduler?.shutdown(true) // Wait for running jobs to complete
            println("Restart scheduler stopped")
        } catch (e: Exception) {
            println("Error stopping restart scheduler: ${e.message}")
        }
    }

    fun getScheduler(): Scheduler? = scheduler

    fun triggerImmediateRestart() {
        println("=== IMMEDIATE RESTART TRIGGERED ===")
        val restartJob = RestartJob()
        restartJob.execute(null)
    }
}