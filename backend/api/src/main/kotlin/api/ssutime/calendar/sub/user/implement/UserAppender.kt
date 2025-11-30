package api.ssutime.calendar.sub.user.implement

import api.ssutime.calendar.sub.user.persistence.UserEntity
import api.ssutime.calendar.sub.user.persistence.UserRepository
import org.springframework.stereotype.Component
import java.util.*

@Component
class UserAppender(
    private val userRepository: UserRepository
) {

    fun append(userId: UUID): User {
        return userRepository.save(UserEntity(id = userId)).toDomain()
    }
}