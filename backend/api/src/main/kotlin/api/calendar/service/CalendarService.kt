package api.calendar.service

interface CalendarService {
    fun fetchIcsBytes(key: String): ByteArray
}
