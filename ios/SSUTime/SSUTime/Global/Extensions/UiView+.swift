//
//  UiView+.swift
//  SSUTime
//
//  Created by 성현주 on 11/1/25.
//

import UIKit

extension UIView {
    func addSubviews(_ views: UIView...) {
        views.forEach { self.addSubview($0) }
    }
}
