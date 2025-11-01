package api.calendar.service

import api.calendar.repository.CalendarLinkRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.server.ResponseStatusException

@Service
class DefaultCalendarService(
    private val calendarLinkRepository: CalendarLinkRepository,
    private val webClient: WebClient
) : CalendarService {

    override fun fetchIcsBytes(key: String): ByteArray {
        val s3Url = calendarLinkRepository.findS3UrlByKey(key)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Calendar not found for key: $key")

        return webClient
            .get()
            .uri(s3Url)
            .retrieve()
            .onStatus({ status -> status.is4xxClientError || status.is5xxServerError }) { response ->
                response.bodyToMono(String::class.java).defaultIfEmpty("")
                    .map { body -> ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to fetch ICS from S3: ${'$'}{response.statusCode()} ${'$'}body") }
            }
            .bodyToMono(ByteArray::class.java)
            .block() ?: throw ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty ICS response from S3")
    }
}
