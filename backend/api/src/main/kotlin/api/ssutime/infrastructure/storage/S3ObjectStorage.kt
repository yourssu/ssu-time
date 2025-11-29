package api.ssutime.infrastructure.storage

import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.ByteArrayResource
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest

@Component
class S3ObjectStorage(
    private val amazonS3: S3Client
) : ObjectStorage {

    private val logger = org.slf4j.LoggerFactory.getLogger(this::class.java)

    @field:Value("\${cloud.aws.s3.bucket}")
    private lateinit var bucketName: String

    override fun download(key: String): ByteArrayResource {
        val objectAsBytes = try {
            val request = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build()

            amazonS3.getObjectAsBytes(request)
        } catch (e: Exception) {
            logger.error("Failed to download object from S3: $key", e)
            throw IllegalStateException("Failed to download object from S3: $key")
        }
        return ByteArrayResource(objectAsBytes.asByteArray())
    }

}