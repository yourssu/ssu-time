package api.ssutime.common.util

object UserAgentParser {

    fun parse(userAgent: String): String {
        return when {
            userAgent.contains("Android", ignoreCase = true) -> "android"
            userAgent.contains("iPhone", ignoreCase = true) ||
                    userAgent.contains("iPad", ignoreCase = true) -> "ios"

            else -> "web"
        }
    }
}