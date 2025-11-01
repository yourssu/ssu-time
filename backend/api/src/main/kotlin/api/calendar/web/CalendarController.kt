package api.calendar.web

import api.calendar.service.CalendarService
import org.springframework.http.CacheControl
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.concurrent.TimeUnit

@RestController
@RequestMapping("/api/calendars")
class CalendarController(
    private val calendarService: CalendarService
) {

    @GetMapping("/{key}")
    fun getCalendar(@PathVariable key: String): ResponseEntity<ByteArray> {
        val bytes = calendarService.fetchIcsBytes(key)
        return buildIcsResponse(key, bytes)
    }

    @GetMapping("/{key}.ics")
    fun getCalendarWithExt(@PathVariable key: String): ResponseEntity<ByteArray> {
        val bytes = calendarService.fetchIcsBytes(key)
        return buildIcsResponse(key, bytes)
    }

    private fun buildIcsResponse(key: String, bytes: ByteArray): ResponseEntity<ByteArray> {
        val headers = HttpHeaders().apply {
            contentType = MediaType.parseMediaType("text/calendar; charset=utf-8")
            set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"${'$'}key.ics\"")
            cacheControl = CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic().headerValue
        }
        return ResponseEntity.ok()
            .headers(headers)
            .body(bytes)
    }
}
