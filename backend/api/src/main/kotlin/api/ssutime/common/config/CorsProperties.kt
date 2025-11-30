package api.ssutime.common.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "spring.cors")
class CorsProperties(
    var allowedOrigins: Array<String> = emptyArray()
)