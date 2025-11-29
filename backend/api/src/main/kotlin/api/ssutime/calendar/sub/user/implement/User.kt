package api.ssutime.calendar.sub.user.implement

import java.time.Instant
import java.util.*

class User(
    val id: UUID,
    val createdAt: Instant,
    val lastAccessedAt: Instant
)