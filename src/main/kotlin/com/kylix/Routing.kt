package com.kylix

import com.kylix.models.ContactRequest
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {

    install(StatusPages) {
        status(HttpStatusCode.NotFound) { call, status ->
            call.respondRedirect("/not-found")
        }
    }

    routing {
        staticResources("/", "resume", index = "sketchy.html")
        staticResources("/not-found", "resume", index = "404.html")
        staticResources("/sitemap.xml", "", index = "sitemap.xml")
        staticResources("/robots.txt", "", index = "robots.txt")
        staticResources("/for-amanda", "happybirthday", index = "index.html")
        get("/for-amanda") {
            call.respondRedirect("/for-amanda/index.html")
        }

        post("/api/contact") {
            try {
                val request = call.receive<ContactRequest>()
                val success = EmailService.sendEmail(
                    name = request.name,
                    replyTo = request.email,
                    message = request.message
                )
                if (success) {
                    call.respond(HttpStatusCode.OK, mapOf("status" to "success", "title" to "Awesome! 🚀", "message" to "Thanks for reaching out! I'll get back to you as soon as possible. Have a great day!"))
                } else {
                    call.respond(HttpStatusCode.InternalServerError, mapOf("status" to "error", "title" to "Oops! 😥", "message" to "Failed to send message. Please try again later or contact me via LinkedIn."))
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.BadRequest, mapOf("status" to "error", "title" to "Error", "message" to "Invalid request payload"))
            }
        }
    }
}
