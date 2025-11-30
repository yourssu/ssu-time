package api.ssutime.calendar.application.dto

import java.util.*

data class CreateUrlRequest(
    val categories: List<String>,
    val provider: String,
    val distinctId: UUID
)