package com.yourssu.widget

import android.annotation.SuppressLint
import android.content.Context
import android.provider.CalendarContract
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.padding
import androidx.glance.text.Text
import androidx.glance.text.TextAlign
import androidx.glance.text.TextStyle
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.Calendar
import java.util.concurrent.TimeUnit

class CalendarWidget : GlanceAppWidget() {

    override val sizeMode = SizeMode.Single

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            val (dDay, events) = getNearestEventData(context)
            MyContent(dDay, events)
        }
    }

    @SuppressLint("MissingPermission")
    private fun getNearestEventData(context: Context): Pair<String, List<String>> {
        try {
            val contentResolver = context.contentResolver
            val calendarEmail = "env952lm2uhd4fkid9qe6l07q1d9nd16@import.calendar.google.com"

            // Find calendar ID
            val calendarProjection = arrayOf(CalendarContract.Calendars._ID)
            val calendarSelection = "${CalendarContract.Calendars.OWNER_ACCOUNT} = ?"
            val calendarSelectionArgs = arrayOf(calendarEmail)
            val calendarCursor = contentResolver.query(
                CalendarContract.Calendars.CONTENT_URI,
                calendarProjection,
                calendarSelection,
                calendarSelectionArgs,
                null
            )

            var calendarId: Long? = null
            calendarCursor?.use {
                if (it.moveToFirst()) {
                    calendarId = it.getLong(0)
                }
            }

            if (calendarId == null) {
                return Pair("N/A", listOf("캘린더를 찾을 수 없습니다."))
            }

            // Find nearest event
            val now = System.currentTimeMillis()
            val eventProjection = arrayOf(CalendarContract.Events.TITLE, CalendarContract.Events.DTSTART)
            val eventSelection = "${CalendarContract.Events.CALENDAR_ID} = ? AND ${CalendarContract.Events.DTSTART} >= ?"
            val eventSelectionArgs = arrayOf(calendarId.toString(), now.toString())
            val eventSortOrder = "${CalendarContract.Events.DTSTART} ASC"
            val eventCursor = contentResolver.query(
                CalendarContract.Events.CONTENT_URI,
                eventProjection,
                eventSelection,
                eventSelectionArgs,
                eventSortOrder
            )

            var nearestEventDtStart: Long? = null
            eventCursor?.use {
                if (it.moveToFirst()) {
                    nearestEventDtStart = it.getLong(1)
                }
            }

            if (nearestEventDtStart == null) {
                return Pair("N/A", listOf("예정된 이벤트가 없습니다."))
            }

            // Calculate D-Day
            val dDayValue = TimeUnit.MILLISECONDS.toDays(nearestEventDtStart!! - now)
            val dDayString = if (dDayValue == 0L) "D-DAY" else "D-${dDayValue}"

            // Get all events on that day
            val dayStart = Calendar.getInstance().apply {
                timeInMillis = nearestEventDtStart!!
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
            }.timeInMillis

            val dayEnd = Calendar.getInstance().apply {
                timeInMillis = nearestEventDtStart!!
                set(Calendar.HOUR_OF_DAY, 23)
                set(Calendar.MINUTE, 59)
                set(Calendar.SECOND, 59)
            }.timeInMillis

            val dayEventProjection = arrayOf(CalendarContract.Events.TITLE, CalendarContract.Events.DTEND)
            val dayEventSelection = "${CalendarContract.Events.CALENDAR_ID} = ? AND ${CalendarContract.Events.DTSTART} >= ? AND ${CalendarContract.Events.DTSTART} <= ?"
            val dayEventSelectionArgs = arrayOf(calendarId.toString(), dayStart.toString(), dayEnd.toString())
            val dayEventCursor = contentResolver.query(
                CalendarContract.Events.CONTENT_URI,
                dayEventProjection,
                dayEventSelection,
                dayEventSelectionArgs,
                null
            )

            val events = mutableListOf<String>()
            val timeFormatter = SimpleDateFormat("MM/dd", Locale.getDefault())
            dayEventCursor?.use {
                val titleColumn = it.getColumnIndex(CalendarContract.Events.TITLE)
                val dtEndColumn = it.getColumnIndex(CalendarContract.Events.DTEND)
                while (it.moveToNext()) {
                    val eventTitle = it.getString(titleColumn)
                    val eventDtEnd = it.getLong(dtEndColumn)
                    val formattedEndTime = timeFormatter.format(eventDtEnd)
                    events.add("$eventTitle ($formattedEndTime)")
                }
            }

            return Pair(dDayString, events.ifEmpty { listOf("일정 없음") })
        } catch (e: SecurityException) {
            return Pair("N/A", listOf("캘린더 접근 권한이 없습니다."))
        }
    }

    @Composable
    private fun MyContent(title: String, events: List<String>) {
        Column(
            modifier = GlanceModifier
                .fillMaxSize()
                .cornerRadius(12.dp),
            verticalAlignment = Alignment.Top,
        ) {
            Text(
                text = title,
                modifier = GlanceModifier
                    .padding(6.dp)
                    .fillMaxWidth(),
                style = TextStyle(
                    textAlign = TextAlign.Center,
                    fontSize = 24.sp
                )
            )
            events.forEach {
                Text(
                    text = it,
                    modifier = GlanceModifier.padding(horizontal = 8.dp),
                    style = TextStyle(
                        fontSize = 12.sp
                    )
                )
            }
        }
    }
}