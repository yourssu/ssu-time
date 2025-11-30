package api.ssutime.calendar.business.dto

import java.util.*

data class UserInfoCommand(
    val distinctId: UUID,
    val provider: String,
    val userAgent: String
)