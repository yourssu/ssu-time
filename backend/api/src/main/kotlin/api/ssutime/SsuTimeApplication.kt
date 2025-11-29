package api.ssutime

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaAuditing

@SpringBootApplication
@EnableJpaAuditing
class SsuTimeApplication

fun main(args: Array<String>) {
    runApplication<SsuTimeApplication>(*args)
}
