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

        // ✅ 테스트용: FCM 토큰 직접 출력 (앱 실행 직후)
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            Messaging.messaging().token { token, error in
                if let error = error {
                    print("❌ FCM 토큰 가져오기 실패:", error.localizedDescription)
                } else if let token = token {
                    print("✅ [실행 직후 현재 FCM 토큰]:", token)
                } else {
                    print("⚠️ FCM 토큰이 아직 생성되지 않았습니다.")
                }
            }
        }

        return true
    }

    private func setupFCM(_ application: UIApplication) {
        Messaging.messaging().delegate = self
        UNUserNotificationCenter.current().delegate = self

        // 알림 권한 요청
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
    // 🔸 푸시 클릭 시
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse) async {
        print("📩 알림 클릭됨:", response.notification.request.content.userInfo)
    }

    // 🔸 앱 실행 중 푸시 수신
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        print("📬 포그라운드 푸시 수신:", notification.request.content.userInfo)
        return [.sound, .banner, .list]
    }

    // 🔸 FCM 토큰 갱신 시 호출
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("🔥 FCM 토큰 갱신됨:", fcmToken ?? "nil")
    }

    // 🔸 APNs 등록 성공
    func application(_ application: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        Messaging.messaging().apnsToken = deviceToken
        let tokenString = deviceToken.map { String(format: "%02X", $0) }.joined()
        print("📱 APNs Device Token:", tokenString)
    }

    // 🔸 APNs 등록 실패
    func application(_ application: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("❌ APNs 등록 실패:", error.localizedDescription)
    }
}
