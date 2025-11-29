package api.ssutime.calendar.business

import api.ssutime.calendar.sub.category.implement.CategoryFetcher
import api.ssutime.calendar.sub.category.implement.CategoryFinder
import api.ssutime.calendar.sub.user.implement.UserAppender
import api.ssutime.calendar.sub.user.implement.UserFinder
import api.ssutime.calendar.util.CategoryObjectMapper
import api.ssutime.infrastructure.storage.ObjectStorage
import org.springframework.core.io.Resource
import org.springframework.stereotype.Service
import java.util.*

@Service
class CalendarService(
    private val userAppender: UserAppender,
    private val userFinder: UserFinder,
    private val categoryFetcher: CategoryFetcher,
    private val categoryFinder: CategoryFinder,
    private val objectStorage: ObjectStorage
) {

    fun subscribe(categories: List<Category>): String {
        val user = userAppender.append()
        categoryFetcher.fetch(categories, user)
        return user.id.toString()
    }

    fun download(userId: UUID): Resource {
        require(userFinder.exist(userId)) { "User not found" }
        val categories = categoryFinder.findCategoryByUserId(userId)
        val key = CategoryObjectMapper.makeKey(categories)
        return objectStorage.download(key)
    }
}