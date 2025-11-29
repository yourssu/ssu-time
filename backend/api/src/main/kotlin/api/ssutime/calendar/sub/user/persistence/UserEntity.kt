package api.ssutime.calendar.sub.user.persistence

import api.ssutime.calendar.sub.user.implement.User
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.*

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener::class)
class UserEntity(
    @field:Id
    val id: UUID,

    @field:CreatedDate
    @field:Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @field:Column(nullable = false)
    val lastAccessedAt: Instant = Instant.now()
) {
    companion object {
        fun from(user: User) =
            UserEntity(id = user.id, createdAt = user.createdAt, lastAccessedAt = user.lastAccessedAt)
    }

    fun toDomain() = User(id, createdAt, lastAccessedAt)
}