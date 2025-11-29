package api.ssutime.calendar.sub.category.implement

import api.ssutime.calendar.business.Category
import api.ssutime.calendar.sub.category.persistence.CategoryRepository
import org.springframework.stereotype.Component
import java.util.*

@Component
class CategoryFinder(
    private val categoryRepository: CategoryRepository
) {

    fun findCategoryByUserId(userId: UUID): List<Category> {
        val categories = categoryRepository.findByUserId(userId)
        return categories.map { it.category }
    }
}