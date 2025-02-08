package com.kylix

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {

    install(StatusPages) {
        status(HttpStatusCode.NotFound) { call, status ->
            call.respondRedirect("/not-found")
        }
    }

    routing {
        staticResources("/", "resume")
        staticResources("/not-found", "resume", index = "404.html")
    }
}
