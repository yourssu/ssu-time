package com.yourssu

import android.Manifest
import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.CalendarContract
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.net.toUri
import androidx.lifecycle.lifecycleScope
import com.mixpanel.android.mpmetrics.MixpanelAPI
import com.yourssu.BuildConfig
import com.yourssu.notification.channelID
import com.yourssu.notification.sendNotification
import android.util.Log
import com.google.firebase.Firebase
import com.google.firebase.messaging.messaging
import com.yourssu.ui.theme.YourssuCalendarTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.net.URL


class MainActivity : ComponentActivity() {

    private val TAG = "MainActivity"



    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
//        enableEdgeToEdge()

        val mixpanelToken = if (BuildConfig.DEBUG) BuildConfig.MIXPANEL_DEV_TOKEN else BuildConfig.MIXPANEL_PROD_TOKEN
        val mixpanel = MixpanelAPI.getInstance(this, mixpanelToken, false)

        Firebase.messaging.token.addOnCompleteListener { task ->
            if (!task.isSuccessful) {
                Log.w(TAG, "Fetching FCM registration token failed", task.exception)
                return@addOnCompleteListener
            }

            // Get new FCM registration token
            val token = task.result

            // Log and toast
            Log.d(TAG, "FCM Registration Token: $token")
        }

        createNotificationChannel()

        setContent {
            YourssuCalendarTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    SelectCalendar(
                        listOf("장학", "총학생회", "단과대", "유세인트", "컴퓨터학부", "글로벌미디어학부", "소프트웨어학부", "AI융합학부"),
                        onLoadCalendar = {
                            val googleCalendarUri = "https://calendar.google.com/calendar/r?cid=env952lm2uhd4fkid9qe6l07q1d9nd16@import.calendar.google.com".toUri()
                            val intent = Intent(Intent.ACTION_VIEW, googleCalendarUri)
                            if (intent.resolveActivity(packageManager) != null) {
                                startActivity(intent)
                            } else {
                                Toast.makeText(this, "구글 캘린더 앱을 열 수 없습니다.", Toast.LENGTH_LONG).show()
                            }
                        },
                        onTestNotification = {
                            sendNotification(this, "테스트 입니다", "테스트 테스트")
                        })

                }
            }
        }
    }

    private fun createNotificationChannel() {
        when {
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
                    PackageManager.PERMISSION_GRANTED -> {

            }
            else -> {
                if(Build.VERSION.SDK_INT >= 33) {
                    requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 0)
                }
            }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Create the NotificationChannel.
            val name = "일정 알림"
            val descriptionText = "일정과 관련된 알림을 받습니다."
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val mChannel = NotificationChannel(channelID, name, importance)
            mChannel.description = descriptionText

            // Register the channel with the system. You can't change the importance
            // or other notification behaviors after this.
            val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(mChannel)
        }
    }
}
