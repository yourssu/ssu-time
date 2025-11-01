package api.calendar.repository

interface CalendarLinkRepository {
    fun findS3UrlByKey(key: String): String?
}
