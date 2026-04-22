package com.kylix

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.apache.commons.mail.DefaultAuthenticator
import org.apache.commons.mail.SimpleEmail
import org.slf4j.LoggerFactory
import java.io.File
import java.util.Properties

object EmailService {
    private val logger = LoggerFactory.getLogger(javaClass)

    private fun loadLocalProperties(): Properties {
        val props = Properties()
        val localFile = File("local.properties")
        if (localFile.exists()) {
            localFile.inputStream().use { props.load(it) }
        } else {
            logger.warn("local.properties not found. SMTP config may be missing.")
        }
        return props
    }

    suspend fun sendEmail(name: String, replyTo: String, message: String): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val props = loadLocalProperties()
                val host = props.getProperty("smtp.host", "smtp.gmail.com")
                val port = props.getProperty("smtp.port", "465").toIntOrNull() ?: 465
                val username = props.getProperty("smtp.username", "")
                val password = props.getProperty("smtp.password", "")

                val email = SimpleEmail()
                email.hostName = host
                email.setSmtpPort(port)
                email.setAuthenticator(DefaultAuthenticator(username, password))
                if (port == 465) {
                    email.isSSLOnConnect = true
                } else if (port == 587) {
                    email.isStartTLSEnabled = true
                }

                email.setFrom(username, "Portfolio Contact")
                email.subject = "New Contact Message from $email"
                email.setMsg("You received a new message from your portfolio website.\n\nFrom: $name\nEmail: $replyTo\n\nMessage:\n$message")
                email.addTo(username)
                email.addReplyTo(replyTo, name)

                email.send()
                logger.info("Email sent successfully from $name")
                true
            } catch (e: Exception) {
                logger.error("Failed to send email: ${e.message}", e)
                false
            }
        }
    }
}
