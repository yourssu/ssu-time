package api.ssutime.infrastructure.storage

import org.springframework.core.io.ByteArrayResource
import org.springframework.stereotype.Component

@Component
interface ObjectStorage {
    fun download(key: String): ByteArrayResource
}