//
//  BaseTargetType.swift
//  SSUTime
//
//  Created by 성현주 on 11/1/25.
//

import Foundation

import Moya

protocol BaseTargetType: TargetType { }

extension BaseTargetType{
    
    var baseURL: URL {
        return URL(string: Config.baseURL)!
    }
    
    var headers: [String : String]? {
        let accessToken = getTokenFromRealm()
        let header = [
            "Content-Type": "application/json",
            "Authorization": accessToken
        ]
        return header
    }
    
    var sampleData: Data {
        return Data()
    }
    
    func getTokenFromRealm() -> String {
        let realm = RealmService()
        return realm.getAccessToken()
    }
}
