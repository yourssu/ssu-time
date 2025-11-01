//
//  UserDefaults+.swift
//  SSUTime
//
//  Created by 박현수 on 11/1/25.
//

import Foundation

extension UserDefaults {
    enum Key {
        static let accessToken = "accessToken"
    }
    enum Group {
        static let shared = UserDefaults(suiteName: "group.com.ssutime.SSUTime")!
    }
}
