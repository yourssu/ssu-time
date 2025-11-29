package api.ssutime.calendar.application

import api.ssutime.calendar.application.dto.CreateUrlRequest
import api.ssutime.calendar.business.CalendarService
import api.ssutime.calendar.business.Category
import org.springframework.core.io.Resource
import org.springframework.http.CacheControl
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.net.URI
import java.util.*

@RestController
@RequestMapping("/api/v1/calendar")
class CalendarController(
    private val calendarService: CalendarService
) {


    @PostMapping("/subscribe-url")
    fun createUrl(
        @RequestHeader("User-Agent", required = true) userAgent: String,
        @RequestBody request: CreateUrlRequest
    ): ResponseEntity<Unit> {
        val categories = try {
            request.categories.map { Category.valueOf(it) }
        } catch (_: IllegalArgumentException) {
            return ResponseEntity.badRequest().build()
        }
        val userId = calendarService.subscribe(categories, userAgent)
        val location = "/api/v1/calendar/$userId"

        return ResponseEntity.created(URI.create(location)).build()
    }

    @GetMapping("/{userId}")
    fun getCalendar(
        @PathVariable userId: String
    ): ResponseEntity<Resource> {
        val uuid = try {
            UUID.fromString(userId)
        } catch (_: IllegalArgumentException) {
            return ResponseEntity.badRequest().build()
        }
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType("text/calendar; charset=utf-8"))
            .cacheControl(CacheControl.noCache())
            .body(calendarService.download(uuid))
    }
}