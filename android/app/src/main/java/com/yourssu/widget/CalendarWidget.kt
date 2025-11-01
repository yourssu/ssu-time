package com.yourssu.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.runtime.key
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
import androidx.glance.preview.ExperimentalGlancePreviewApi
import androidx.glance.preview.Preview
import androidx.glance.text.Text
import androidx.glance.text.TextAlign
import androidx.glance.text.TextStyle

class CalendarWidget : GlanceAppWidget() {

    override val sizeMode = SizeMode.Single

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            // create your AppWidget here
            MyContent("D-3", listOf("성적 처리기간", "종강"))
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
                key(it) {
                    Text(
                        text = it,
                        style = TextStyle(
                            fontSize = 12.sp
                        )
                    )
                }
            }
        }
    }

    @OptIn(ExperimentalGlancePreviewApi::class)
    @Preview
    @Composable
    private fun MyContentPreview() {
        MyContent("D-3", listOf("성적 처리기간", "종강"))
    }
}