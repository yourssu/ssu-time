package api.ssutime.calendar.util

import api.ssutime.calendar.business.Category


object CategoryObjectMapper {
    private const val PREFIX = "merged/merged_"
    private const val SUFFIX = ".ics"
    fun makeKey(categories: List<Category>): String {

        if (categories.size >= Category.entries.size) {
            return "${PREFIX}all$SUFFIX"
        }
        val result = Category.entries
            .filter { categories.contains(it) }.joinToString("_") { it.name.lowercase() }
        return PREFIX + result + SUFFIX
    }
}