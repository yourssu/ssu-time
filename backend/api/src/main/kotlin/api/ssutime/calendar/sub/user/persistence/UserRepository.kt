package api.ssutime.calendar.sub.user.persistence

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface UserRepository: JpaRepository<UserEntity, UUID> {
}