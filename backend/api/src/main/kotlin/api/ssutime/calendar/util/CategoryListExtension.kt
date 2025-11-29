package api.ssutime.calendar.util

import api.ssutime.calendar.business.Category

fun List<Category>.toMap() =
    Category.entries.associate {
        it.name.lowercase() to this.contains(it).toString().uppercase()
    }.toMutableMap()
