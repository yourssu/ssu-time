//
//  AppDelegate.swift
//  SSUTime
//
//  Created by 성현주 on 11/1/25.
//

import UIKit
import FirebaseCore
import FirebaseMessaging


@main
class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        FirebaseApp.configure()
        setupFCM(application)
        return true
    }

    private func setupFCM(_ application: UIApplication) {
        Messaging.messaging().delegate = self
        UNUserNotificationCenter.current().delegate = self

        UNUserNotificationCenter.current().requestAuthorization(options: [.sound, .alert, .badge]) { isAgree, error in
            if isAgree {
                print("🔔 알림 허용됨")
            } else {
                print("🔕 알림 거부됨 또는 오류:", error?.localizedDescription ?? "none")
            }
        }

        application.registerForRemoteNotifications()
    }
}

extension AppDelegate: UNUserNotificationCenterDelegate, MessagingDelegate {
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse) async {
        print("📩 알림 클릭됨:", response.notification.request.content.userInfo)
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        print("📬 포그라운드 푸시 수신:", notification.request.content.userInfo)
        return [.sound, .banner, .list]
    }

    // ✅ 여기서 FCM 토큰을 받습니다 - APNs 토큰 설정 후에 자동 호출됨
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("🔥 FCM 토큰 갱신됨:", fcmToken ?? "nil")

        // ✅ 여기서 서버로 토큰 전송
        if let token = fcmToken {
            // TODO: 백엔드로 전송
            // YourAPI.updateFCMToken(token)
        }
    }

    func application(_ application: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        Messaging.messaging().apnsToken = deviceToken
        let tokenString = deviceToken.map { String(format: "%02X", $0) }.joined()
        print("📱 APNs Device Token:", tokenString)

        // ✅ 선택사항: APNs 토큰 설정 직후 FCM 토큰 가져오기
        Messaging.messaging().token { token, error in
            if let error = error {
                print("❌ FCM 토큰 가져오기 실패:", error.localizedDescription)
            } else if let token = token {
                print("✅ FCM 토큰:", token)
            }
        }
    }

    func application(_ application: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("❌ APNs 등록 실패:", error.localizedDescription)
    }
}
