package api.ssutime.common.util

object UserAgentParser {

    fun parse(userAgent: String): String {
        return when {
            userAgent.contains("Android", ignoreCase = true) -> "Android"
            userAgent.contains("iPhone", ignoreCase = true) ||
                    userAgent.contains("iPad", ignoreCase = true) -> "iOS"

            else -> "Web"
        }
    }
}