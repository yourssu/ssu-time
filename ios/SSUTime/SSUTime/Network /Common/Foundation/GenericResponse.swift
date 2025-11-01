//
//  GenericResponse.swift
//  SSUTime
//
//  Created by 성현주 on 11/1/25.
//

import Foundation

struct GenericResponse: Codable {
    let isSuccess: Bool
    let code: Int
    let message: String
    let result: String
}
