package api.calendar.repository

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Repository

@Repository
@ConditionalOnProperty(name = ["app.calendar.rds.enabled"], havingValue = "true")
class JdbcCalendarLinkRepository(
    private val jdbcTemplate: JdbcTemplate
) : CalendarLinkRepository {

    override fun findS3UrlByKey(key: String): String? {
        val sql = "SELECT s3_url FROM calendar_link WHERE `key` = ? LIMIT 1"
        val results = jdbcTemplate.query(sql, arrayOf(key)) { rs, _ -> rs.getString("s3_url") }
        return results.firstOrNull()
    }
}
