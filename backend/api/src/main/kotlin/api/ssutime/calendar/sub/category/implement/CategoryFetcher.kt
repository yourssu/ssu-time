package api.ssutime.calendar.sub.category.implement

import api.ssutime.calendar.business.Category
import api.ssutime.calendar.sub.category.persistence.CategoryRepository
import api.ssutime.calendar.sub.category.persistence.SubscribeCategoryEntity
import api.ssutime.calendar.sub.user.implement.User
import api.ssutime.calendar.sub.user.persistence.UserEntity
import org.springframework.stereotype.Component

@Component
class CategoryFetcher(
    private val categoryRepository: CategoryRepository
) {

    fun fetch(categories: List<Category>, user: User) {
        val entities = categories.map { SubscribeCategoryEntity(category = it, user = UserEntity(user.id)) }
        categoryRepository.removeByUserId(user.id)
        categoryRepository.saveAll(entities)
    }
}