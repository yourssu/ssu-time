package api.ssutime.calendar.business

import api.ssutime.calendar.business.dto.UserInfoCommand
import api.ssutime.calendar.sub.category.implement.CategoryFetcher
import api.ssutime.calendar.sub.category.implement.CategoryFinder
import api.ssutime.calendar.sub.user.implement.UserAppender
import api.ssutime.calendar.sub.user.implement.UserFinder
import api.ssutime.calendar.util.CategoryObjectMapper
import api.ssutime.calendar.util.toMap
import api.ssutime.common.util.UserAgentParser
import api.ssutime.infrastructure.mixpanel.MessageSender
import api.ssutime.infrastructure.storage.ObjectStorage
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.Resource
import org.springframework.stereotype.Service
import java.util.*

@Service
class CalendarService(
    private val userAppender: UserAppender,
    private val userFinder: UserFinder,
    private val categoryFetcher: CategoryFetcher,
    private val categoryFinder: CategoryFinder,
    private val objectStorage: ObjectStorage,
    private val messageSender: MessageSender
) {

    @Value("\${mixpanel.event-name}")
    private lateinit var eventName: String

    fun subscribe(categories: List<Category>, userInfoCommand: UserInfoCommand): String {
        val user = userAppender.append(userInfoCommand.distinctId)
        val os = UserAgentParser.parse(userInfoCommand.userAgent)
        categoryFetcher.fetch(categories, user)
        val jsonMap = categories.toMap()
        jsonMap["os"] = os
        jsonMap["provider"] = userInfoCommand.provider
        messageSender.send(jsonMap, user.id.toString(), eventName)
        return user.id.toString()
    }

    fun download(userId: UUID): Resource {
        require(userFinder.exist(userId)) { "User not found" }
        val categories = categoryFinder.findCategoryByUserId(userId)
        val key = CategoryObjectMapper.makeKey(categories)
        return objectStorage.download(key)
    }
}