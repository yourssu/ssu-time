package api.ssutime.calendar.sub.category.persistence

import org.springframework.data.jpa.repository.JpaRepository

interface CategoryRepository : JpaRepository<SubscribeCategoryEntity, Long> {
    fun findByUserId(userId: java.util.UUID): List<SubscribeCategoryEntity>
    fun removeByUserId(userId: java.util.UUID)
}