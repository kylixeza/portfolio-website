package com.kylix.models

import kotlinx.serialization.Serializable

@Serializable
data class ContactRequest(
    val name: String,
    val email: String,
    val message: String
)
