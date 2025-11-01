package api.calendar.repository

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Repository

@Repository
@ConditionalOnProperty(name = ["app.calendar.rds.enabled"], havingValue = "false", matchIfMissing = true)
class StubCalendarLinkRepository : CalendarLinkRepository {
    override fun findS3UrlByKey(key: String): String? = null
}
