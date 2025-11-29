package api.ssutime.calendar.sub.user.implement

import api.ssutime.calendar.sub.user.persistence.UserRepository
import org.springframework.stereotype.Component
import java.util.*

@Component
class UserFinder(
    private val userRepository: UserRepository
) {
    fun exist(userId: UUID): Boolean {
        return userRepository.existsById(userId)
    }
}