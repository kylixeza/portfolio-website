package com.kylix

import io.ktor.server.application.*
import org.slf4j.LoggerFactory

fun main(args: Array<String>) {
    LoggerFactory.getLogger("Application").debug("Kylix Resume Application started successfully.")
    CronManager.start()
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureRouting()
    configureLogging()
}
