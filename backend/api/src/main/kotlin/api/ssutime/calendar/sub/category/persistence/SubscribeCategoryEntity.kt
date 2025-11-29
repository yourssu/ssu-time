package api.ssutime.calendar.sub.category.persistence

import api.ssutime.calendar.business.Category
import api.ssutime.calendar.sub.user.persistence.UserEntity
import jakarta.persistence.*

@Entity
@Table(name = "subscribe_category")
class SubscribeCategoryEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    @Enumerated(value = EnumType.STRING)
    val category: Category,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: UserEntity
)