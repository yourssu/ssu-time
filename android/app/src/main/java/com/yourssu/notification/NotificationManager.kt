package com.yourssu.notification

import android.Manifest
import android.app.ActivityManager
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.yourssu.R
import java.util.UUID
import kotlin.uuid.Uuid

const val channelID = "Schedule"

fun sendNotification(context: Context, title: String, body: String) {
    val builder = NotificationCompat.Builder(context, channelID)
        .setSmallIcon(R.mipmap.ic_launcher)
        .setContentTitle(title)
        .setContentText(body)
        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
//        .setContentIntent() TODO
        .setAutoCancel(true)

    with(NotificationManagerCompat.from(context)) {
        if(ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            return@with
        }
        notify(System.currentTimeMillis().toInt(), builder.build())

    }
}