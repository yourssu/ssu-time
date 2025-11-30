package api.ssutime.calendar.util

import api.ssutime.calendar.business.Category

fun List<Category>.toMap(): MutableMap<String, Any> =
    Category.entries.associate {
        "option_${it.name.lowercase()}" to this.contains(it)
    }.toMutableMap()
